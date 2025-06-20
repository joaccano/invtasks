import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const RegistroCompartidoController = {

    getUrlRegister: async (req: Request, res: Response) => {
        const { id } = req.params;
        const query: any = req.query;

        const { tiempoPermiso } = req.body;
        const queryAux = objectToQueryString(query)
        const token = jwt.sign(
            {
                idRegistro: id,
                params: queryAux
            },
            String(process.env.SECRET_KEY_JWT),
            { expiresIn: String(process.env.EXPIRES_JWT) || tiempoPermiso }
        );
        res.status(200).json({ msg: 'Url generada para compartir registro', data: { token } });
    }

}
function objectToQueryString(obj: any, parentKey = '') {
    let queryString: any = [];
    // Iteramos sobre las claves principales (en este caso 'filter')
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const newKey = parentKey ? `${parentKey}[${key}]` : key;

            // Si el valor es un objeto, llamamos recursivamente a la función
            if (typeof value === 'object' && value !== null) {
                // Llamamos recursivamente para manejar objetos anidados
                queryString.push(objectToQueryString(value, newKey));
            } else {
                // Si el valor no es un objeto, lo agregamos al query string
                queryString.push(`${encodeURIComponent(newKey)} = ${encodeURIComponent(value)}`);
            }
        }
    }
    return queryString.join('&');
}