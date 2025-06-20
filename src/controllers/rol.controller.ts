import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { RolRepository } from "../repositories/rol.repository";
import { PermisoRepository } from "../repositories/permiso.repository";

const prisma = new PrismaClient();
const rolRepository = new RolRepository();
const permisoRepository = new PermisoRepository();

export const RolController = {
    // Obtener todos los roles
    getAll: async (req: Request, res: Response) => {
        try {
            let url = decodeURIComponent(req.url);
            if(!url.includes('?')) url =  `${url}?`;
            const params = new URLSearchParams(url.split('?')[1]);
            const limit = parseInt(params.get('take') || '0');
            const page =parseInt(params.get('page') || '1');
            params.delete('page');
            const skip = (page - 1) * limit;
            params.set('skip', skip.toString());
            const roles = await rolRepository.findMany("?"+decodeURIComponent(params.toString()));
            const links = await rolRepository.getPaginate(params, limit, page,"/administrator/roles");

            res.status(200).json({ msg: `${roles.length > 0 ? 'Se han encontrado roles' : 'No se han encontrado roles'}`, data: roles, links});
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener las registros' });
        }
    },
    getAllPermissions: async (req: Request, res: Response) => {
        try {
            let url = decodeURIComponent(req.url);
            if(!url.includes('?')) url =  `${url}?`;
            const params = new URLSearchParams(url.split('?')[1]);
            const limit = parseInt(params.get('take')==="Infinity"? "0" : params.get("take") || '0');
            const page =parseInt(params.get('page') || '1');
            params.delete('page');
            const skip = (page - 1) * limit;
            params.set('skip', skip.toString());
            console.log(skip, page, limit);
            console.log("params: ",params.toString());
            const permisos = await permisoRepository.findMany("?"+decodeURIComponent(params.toString()));
            const formattedPermisos = permisos.map((permiso: {idPermiso:string, nombre: string; descripcion: string }) => {
                if(permiso.nombre.includes("-")){
                    const [ permission,nombre] = permiso.nombre.split('-');
                    return {
                        idPermiso: permiso.idPermiso,
                        plataforma: "app",
                        nombre: nombre,
                        permiso: permission,
                        descripcion: permiso.descripcion,
                    };
                }else{
                    const [plataforma, nombre, permission ] = permiso.nombre.split('_');
                    return {
                        idPermiso: permiso.idPermiso,
                        plataforma: plataforma,
                        nombre: nombre,
                        permiso: permission,
                        descripcion: permiso.descripcion,
                    };
                }
           
            });
          
            const links = await permisoRepository.getPaginate(params, limit, page,"/administrator/permissions");
            res.status(200).json({ msg: `${permisos.length > 0 ? 'Se han encontrado permisos' : 'No se han encontrado permisos'}`, data: formattedPermisos, links});
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener los permisos' });
        }
    },
    // Obtener un rol por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await rolRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    getAdminById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const rol = await prisma.rol.findUnique({ where: { idRol: parseInt(id) }, 
                include: {
                    rolPermisoList: {
                        include: {
                            permiso: true, // Aquí incluimos los detalles del permiso asociado
                        },
                    },
                }, 
            });
            if (!rol) return res.status(404).json({ msg: 'Rol no encontrado' });
             // Transform the rol object to the desired format
        const permisos = rol.rolPermisoList.map(rp => rp.permiso);
        
        const formattedPermisos = permisos.map((permiso: {idPermiso: number, nombre: string; descripcion: string | null }) => {
            if(permiso.nombre.includes("-")){
                const [ permission,nombre] = permiso.nombre.split('-');
                return {
                    idPermiso: permiso.idPermiso,
                    plataforma: "app",
                    nombre: nombre,
                    permiso: permission,
                    descripcion: permiso.descripcion,
                };
            }else{
                const [plataforma, nombre, permission ] = permiso.nombre.split('_');
                return {
                    idPermiso: permiso.idPermiso,
                    plataforma: plataforma,
                    nombre: nombre,
                    permiso: permission,
                    descripcion: permiso.descripcion,
                };
            }
        });
        
        const transformedRol = {
            ...rol,
            permisos:formattedPermisos,
        };
        const {rolPermisoList, ...rolData} = transformedRol;
        res.status(200).json({ msg: 'Se ha encontrado el rol', data: rolData, status: "SUCCESSFULL" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ msg: 'Error al obtener el rol', status: "ERROR" });
        }
    },

    // Crear un nuevo rol (create)
    create: async (req: Request, res: Response) => {
        const { nombre, descripcion, permisos } = req.body;
        if (!permisos) return res.status(404).json({ msg: 'Faltan permisos' });
        try {
            const nuevoRol = await prisma.rol.create({  data: { nombre, descripcion, fechaAlta: new Date(), fechaBaja: null }, });
            const rolPermisos = permisos.map((idPermiso: number) => ({
                idPermiso,
                idRol: nuevoRol.idRol,
                fechaDesde: new Date(),
            }));
            await prisma.rolPermiso.createMany({ data: rolPermisos, });
            res.status(200).json({ msg: 'Se ha creado el rolPermiso.', data: nuevoRol, status: "SUCCESSFULL" });
        } catch (error:any) {
            res.status(500).json({ msg: 'Error al crear el rol', detail: error.message });
        }
    },

    // Actualizar un rol (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { nombre, descripcion,permisos } = req.body;
        const payload: any = { nombre, descripcion };
        try {
            const rolActualizado = await prisma.rol.update({
                where: { idRol: parseInt(id) },
                data: payload,
            });

            // Obtener los permisos actuales del rol
            const rolPermisosActuales = await prisma.rolPermiso.findMany({
                where: { idRol: parseInt(id) },
            });
            console.log("rolPermisosActuales: ",rolPermisosActuales);
            // Filtrar los permisos que no están en el array de permisos proporcionado
            const permisosAEliminar = rolPermisosActuales.filter(rp => !permisos.includes(rp.idPermiso));
            console.log("permisosAEliminar: ",permisosAEliminar);
            // Eliminar los permisos filtrados
            const test = await prisma.rolPermiso.deleteMany({
                where: {
                    idRol: parseInt(id),
                    idPermiso: { in: permisosAEliminar.map(rp => rp.idPermiso) },
                },
            });
            console.log("test: ",test);
            const rolPermisos = permisos
                .filter((idPermiso: number) => !rolPermisosActuales.some((rp: any) => rp.idPermiso === idPermiso))
                .map((idPermiso: number) => ({
                    idPermiso,
                    idRol: rolActualizado.idRol,
                    fechaDesde: new Date(),
                }));
            await prisma.rolPermiso.createMany({ data: rolPermisos });
    
            res.status(200).json({ msg: 'Se ha actualizado el rol.', data: rolActualizado, status: "SUCCESSFULL" });
        } catch (error:any) {
            res.status(500).json({ msg: 'Error al actualizar el rol', detail: error.message, status:"ERROR" });
        }
    },

    // Eliminar un rol (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {

            const usuariosConRol = await prisma.usuario.findMany({
                where: {
                    idRol: parseInt(id),
                },
            });

            if (usuariosConRol.length > 0) {
                return res.status(400).json({ msg: 'No se puede eliminar el rol porque está asociado a uno o más usuarios.', status: "ERROR" });
            }
            await prisma.rolPermiso.deleteMany({
                where: {
                    idRol: parseInt(id),
                },
            });
            await prisma.rol.delete({ where: { idRol: parseInt(id) }, });
            res.status(200).json({ msg: 'Se ha eliminado la categoría.', status: "SUCCESSFULL" });
        } catch (error:any) {
            res.status(500).json({ msg: 'Error al eliminar el rol', detail: error.message, status: "ERROR" });
        }
    },
}
