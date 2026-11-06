// Tema visual (claro / oscuro) guardado por navegador
const CLAVE = 'tema';

export const leerTema = () => {
  try {
    return localStorage.getItem(CLAVE) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const aplicarTema = (tema) => {
  const raiz = document.documentElement;
  raiz.dataset.theme = tema;
  raiz.dataset.bsTheme = tema; // Bootstrap 5.3 también adapta sus componentes
  try {
    localStorage.setItem(CLAVE, tema);
  } catch {
    // Sin almacenamiento disponible: el tema solo dura esta sesión
  }
};
