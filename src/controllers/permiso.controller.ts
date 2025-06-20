import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { PermisoRepository } from "../repositories/permiso.repository";
import { stat } from "fs";

const prisma = new PrismaClient();
const permisoRepository = new PermisoRepository();

export const PermisoController = {
    // Obtener todos los permisos
    getAll: async (req: Request, res: Response) => {
        try {
            const registros = await permisoRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${registros.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: registros});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    getAdminAll: async (req: Request, res: Response) => {
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
            const formattedPermisos = permisos.map((permiso: { nombre: string; descripcion: string }) => {
                if(permiso.nombre.includes("-")){
                    const [ permission,idPermission] = permiso.nombre.split('-');
                    return {
                        idPermiso: idPermission,
                        plataforma: "app",
                        nombre: idPermission,
                        descripcion: permiso.descripcion,
                    };
                }else{
                    const [plataforma, idPermiso,  ] = permiso.nombre.split('_');
                    return {
                        idPermiso: idPermiso,
                        plataforma: plataforma,
                        nombre: idPermiso,
                        descripcion: permiso.descripcion,
                    };
                }
            });
            const uniquePermisos = Array.from(new Set(formattedPermisos.map((p: { idPermiso: string }) => p.idPermiso)))
            .map(idPermiso => {
                return formattedPermisos.find((p: { idPermiso: string }) => p.idPermiso === idPermiso);
            });
            const links = await permisoRepository.getPaginate(params, limit, page,"/administrator/permissions");
            res.status(200).json({ msg: `${permisos.length > 0 ? 'Se han encontrado permisos' : 'No se han encontrado permisos'}`, data: uniquePermisos, links});
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener las registros' });
        }
    },
    
    // Obtener un permiso por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await permisoRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    getAdminById: async (req: Request, res: Response) => {
        const { id } = req.params;
        const [plataforma, modulo] = id.split("_");
        try {
            const permiso = await prisma.permiso.findFirst({
                where: { nombre: { contains: plataforma === "admin" ? `_${modulo}_` : `-${modulo}` } },
            });

            if (!permiso) {
                return res.status(404).json({ msg: 'Permiso no encontrado' });
            }

            const [prefix, idPermission] = plataforma === "admin" ? permiso.nombre.split('_') : permiso.nombre.split('-');
            const data = {
                idPermiso: idPermission,
                plataforma: plataforma === "admin" ? plataforma : "app",
                nombre: idPermission,
                descripcion: permiso.descripcion,
            };

            res.status(200).json({ msg: 'Se ha encontrado el permiso', data: data, status: "SUCCESSFULL" });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el permiso', detail: error.message, status: "ERROR" });
        }
    },
    
    // Crear un nuevo permiso (create)
    create: async (req: Request, res: Response) => {
        const {plataforma, nombre, descripcion } = req.body;
        try {
            if(plataforma === "admin"){

                ["leer", "crear", "editar", "eliminar"].forEach(async (accion) => {
                    const name = `${plataforma}_${nombre}_${accion}`;
                await prisma.permiso.create({
                    data: { nombre:name, descripcion, fechaAlta: new Date(), fechaBaja: null },
                });
            });
            }else{

                ["list", "create", "edit", "show", "delete"].forEach(async (accion) => {{
                    const name = `${accion}-${nombre}`;
                    await prisma.permiso.create({
                        data: { nombre:name, descripcion, fechaAlta: new Date(), fechaBaja: null },
                    });  
                 }
                 })
            }
        res.status(200).json({ msg: 'Se ha creado el permiso.', data:{}, status: "SUCCESSFULL" });
        } catch (error:any) {
            res.status(500).json({ msg: 'Error al crear el permiso', detail: error.message,status: "ERROR" }); 
    
        }
    },
    
    // Actualizar un permiso (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { plataforma, nombre, descripcion } = req.body;
        try {
            const permisos = await prisma.permiso.findMany({
                where: { nombre: { contains: plataforma === "admin" ? `_${id}_` : `-${id}` } },
            });

            await Promise.all(permisos.map(async (permiso) => {
                const newNombre = plataforma === "admin"
                    ? `${plataforma}_${nombre}_${permiso.nombre.split('_')[2]}`
                    : `${permiso.nombre.split('-')[0]}-${nombre}`;
                await prisma.permiso.update({
                    where: { idPermiso: permiso.idPermiso },
                    data: { nombre: newNombre, descripcion },
                });
            }));

            res.status(200).json({ msg: 'Se ha actualizado el permiso.', data: {}, status: "SUCCESSFULL" });
        } catch (error: any) {
            console.log("error: ", error);
            res.status(500).json({ msg: 'Error al actualizar el permiso', detail: error.message, status: "ERROR" });
        }
    },
    
    // Eliminar un permiso (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        const [plataforma, nombre] = id.split('_');
        try {
            const permisos = await prisma.permiso.findMany({
                where: {
                    nombre: {
                        contains: plataforma === "admin" ? `_${nombre}_` : `-${nombre}`
                    }
                }
            });
            const permisoIds = permisos.map(permiso => permiso.idPermiso);
            const rolesWithPermisos = await prisma.rolPermiso.findMany({
                where: {
                    idPermiso: {
                        in: permisoIds
                    }
                }
            });

            if (rolesWithPermisos.length > 0) {
                return res.status(400).json({ msg: 'No se puede eliminar el permiso porque está asociado a uno o más roles.', status: "ERROR" });
            }
          
            await Promise.all(permisos.map(async (permiso) => {
                await prisma.permiso.delete({
                    where: { idPermiso: permiso.idPermiso },
                });
            }));
            res.status(200).json({ msg: 'Se ha eliminado el permiso.', status: "SUCCESSFULL" });
        } catch (error:any) {
            console.log("error: ", error);
            res.status(500).json({ msg: 'Error al eliminar el permiso', detail: error.message, status: "ERROR" });
        }
    },
}
