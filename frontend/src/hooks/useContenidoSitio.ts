import { useEffect, useState } from 'react';
import api from '../lib/api';

export type ImagenSeccion = { imagen: string; alt: string };

/** Keyed by `clave`: { home_hero: { imagen, alt } } */
export type ContenidoSitio = Record<string, ImagenSeccion>;

const VACIO: ContenidoSitio = {};

/**
 * Fotos de las secciones, cargadas por el admin.
 *
 * Es una mejora progresiva, no un requisito: si la API falla o todavia no hay
 * ninguna foto subida, devuelve un objeto vacio y el sitio usa su diseno por
 * defecto. Un fallo de esta request no puede dejar la portada en blanco.
 */
export function useContenidoSitio(): ContenidoSitio {
  const [contenido, setContenido] = useState<ContenidoSitio>(VACIO);

  useEffect(() => {
    let vigente = true;

    api
      .get<{ clave: string; imagen: string; alt_imagen: string }[]>('/contenido-sitio/')
      .then(({ data }) => {
        if (!vigente) return;
        const mapa: ContenidoSitio = {};
        for (const item of data) {
          if (item.imagen) {
            mapa[item.clave] = { imagen: item.imagen, alt: item.alt_imagen || '' };
          }
        }
        setContenido(mapa);
      })
      .catch(() => {
        // Silencioso a proposito: el diseno por defecto ya es valido.
      });

    return () => {
      vigente = false;
    };
  }, []);

  return contenido;
}
