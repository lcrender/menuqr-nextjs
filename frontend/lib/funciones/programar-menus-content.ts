import { type FuncionesSlug } from '../funciones-nav';

export const PROGRAMAR_MENUS_PATH = '/funciones/programar-menus' as const;

/**
 * Medios: reutiliza capturas existentes donde aplica; null = placeholder.
 * Sustituir por assets propios en /funciones/programar-menus/ cuando estén listos.
 */
export const PROGRAMAR_MENUS_MEDIA = {
  /** YouTube del hero: https://youtu.be/1YOvNx1fVpc */
  heroYoutubeId: '1YOvNx1fVpc' as string | null,
  heroPoster: 'https://i.ytimg.com/vi/1YOvNx1fVpc/hqdefault.jpg' as string | null,
  heroVisual: '/funciones/menu-qr-dinamico/mismo-qr-carta-actualizada.avif' as string | null,
  momentVisual: '/funciones/programar-menus/programar-menu-digital-qr.avif' as string | null,
  compareVisual: null as string | null,
  panelManage: '/funciones/programar-menus/panel-programacion-menu.avif' as string | null,
  sameQrVisual: '/funciones/menu-qr-dinamico/mismo-qr-carta-actualizada.avif' as string | null,
  benefitsVisual: '/funciones/menu-qr-dinamico/demo-menu-vista-movil.avif' as string | null,
  manageVisual: '/funciones/programar-menus/programar-menu-digital-qr.avif' as string | null,
  ctaFinal: '/funciones/menu-qr-dinamico/cta-final.avif' as string | null,
} as const;

export const PROGRAMAR_MENUS_SEO = {
  title: 'Programar menús por días y horarios | Carta digital',
  description:
    'Programa los menús de tu restaurante por días y horarios. Muestra automáticamente desayunos, almuerzos, cenas o promociones con el mismo código QR.',
} as const;

export type ProgramarMenusFaqItem = { question: string; answer: string };

export const PROGRAMAR_MENUS_FAQ: ProgramarMenusFaqItem[] = [
  {
    question: '¿Puedo programar un menú para que aparezca todos los días?',
    answer:
      'Sí. Puedes seleccionar el menú y definir una franja horaria que se repita todos los días.',
  },
  {
    question: '¿Puedo mostrar un menú solamente ciertos días?',
    answer:
      'Sí. Puedes seleccionar días concretos de la semana y establecer un horario de inicio y finalización.',
  },
  {
    question: '¿Necesito un código QR diferente para cada menú?',
    answer:
      'No. Los clientes pueden utilizar el mismo código QR y acceder al menú disponible según el día y la hora.',
  },
  {
    question: '¿Puedo programar un menú de desayuno y otro de cena?',
    answer:
      'Sí. Puedes crear ambos menús y configurar una franja horaria diferente para cada uno.',
  },
  {
    question: '¿Puedo cambiar los horarios después de guardar la programación?',
    answer: 'Sí. Puedes modificar los días y horarios desde el panel de administración.',
  },
  {
    question: '¿Qué ocurre fuera del horario programado?',
    answer:
      'El menú deja de estar disponible fuera de la franja configurada. La carta que verá el cliente dependerá de los demás menús activos o programados en el restaurante.',
  },
  {
    question: '¿Puedo programar un menú solamente los fines de semana?',
    answer:
      'Sí. Puedes seleccionar sábado y domingo y definir el horario en el que debe mostrarse.',
  },
  {
    question: '¿Puedo programar productos individuales?',
    answer:
      'La programación se aplica a menús completos. Los productos se gestionan dentro de cada menú.',
  },
  {
    question: '¿Puedo utilizar la programación para un happy hour?',
    answer:
      'Sí. Puedes crear un menú específico para la promoción y mostrarlo solamente los días y horarios correspondientes.',
  },
  {
    question: '¿Los clientes necesitan instalar una aplicación?',
    answer: 'No. Consultan la carta directamente desde el navegador del teléfono.',
  },
  {
    question: '¿Puedo desactivar una programación temporalmente?',
    answer:
      'Sí. Puedes desactivar la programación de un menú desde el panel sin necesidad de borrar la carta. También puedes modificar sus días u horarios.',
  },
  {
    question: '¿Qué sucede si dos menús tienen horarios superpuestos?',
    answer:
      'Si dos menús programados coinciden en el mismo momento, ambos pueden aparecer disponibles. Para evitar confusiones, revisa la configuración y procura que las franjas no se solapen.',
  },
];

export const PROGRAMAR_MENUS_MOMENT_BENEFITS = [
  'Diferentes menús según el momento del día.',
  'Programación para todos los días o días específicos.',
  'Horarios de inicio y finalización.',
  'Mismo código QR para todas las cartas.',
  'Menos cambios manuales.',
  'Mayor control sobre la oferta.',
  'Experiencia más clara para el cliente.',
] as const;

export const PROGRAMAR_MENUS_COMPARE_MANUAL = [
  'Activar y desactivar cartas cada día.',
  'Recordar los horarios de cada menú.',
  'Riesgo de mostrar una carta fuera de horario.',
  'Cambios repetitivos durante la jornada.',
  'Mayor dependencia del personal.',
] as const;

export const PROGRAMAR_MENUS_COMPARE_SCHEDULED = [
  'Configuración previa de días y horarios.',
  'Activación automática.',
  'Mismo código QR.',
  'Menú adecuado en cada momento.',
  'Menos tareas manuales.',
] as const;

export const PROGRAMAR_MENUS_MODE_EVERY_DAY = [
  'Desayunos todos los días de 08:00 a 12:00.',
  'Carta de almuerzo todos los días de 12:00 a 16:00.',
  'Carta nocturna todos los días de 19:00 a 23:30.',
] as const;

export const PROGRAMAR_MENUS_MODE_SOME_DAYS = [
  'Menú ejecutivo de lunes a viernes de 12:00 a 16:00.',
  'Brunch los sábados y domingos de 10:00 a 15:00.',
  'Happy hour de miércoles a viernes de 18:00 a 20:00.',
  'Carta especial los viernes y sábados por la noche.',
] as const;

export const PROGRAMAR_MENUS_HOW_POINTS = [
  {
    title: 'Selecciona el menú',
    body: 'Escoge la carta que quieres programar entre los menús creados para tu restaurante. Puede ser un menú de desayunos, almuerzos, cenas, bebidas, promociones o cualquier otra propuesta.',
  },
  {
    title: 'Elige los días',
    body: 'Indica si el menú estará disponible todos los días o selecciona días concretos de la semana.',
  },
  {
    title: 'Define el horario',
    body: 'Añade una hora de inicio y una hora de finalización para controlar durante qué franja se mostrará la carta.',
  },
  {
    title: 'Guarda la programación',
    body: 'Una vez configurada, la programación queda vinculada al menú y comienza a aplicarse automáticamente.',
  },
  {
    title: 'Modifica la programación cuando lo necesites',
    body: 'Puedes cambiar los días, ampliar el horario, reducir la franja o desactivar temporalmente la programación desde el panel.',
  },
] as const;

export const PROGRAMAR_MENUS_SAME_QR_EXAMPLES = [
  'A las 09:00, el cliente escanea el QR y consulta el menú de desayunos.',
  'A las 13:00, el mismo código muestra el menú ejecutivo.',
  'A las 20:00, el cliente accede a la carta de cena.',
] as const;

export const PROGRAMAR_MENUS_DAY_SLOTS = [
  {
    title: 'Desayunos',
    schedule: 'Todos los días de 08:00 a 12:00.',
    body: 'Café, infusiones, tostadas, bollería, bowls y opciones de desayuno.',
  },
  {
    title: 'Almuerzos',
    schedule: 'Todos los días de 12:00 a 16:00.',
    body: 'Entradas, platos principales, menú ejecutivo, bebidas y postres.',
  },
  {
    title: 'Merienda',
    schedule: 'Todos los días de 16:00 a 19:00.',
    body: 'Cafetería, pastelería, bebidas frías y opciones para compartir.',
  },
  {
    title: 'Cena',
    schedule: 'Todos los días de 19:00 al cierre.',
    body: 'Carta completa, platos especiales, vinos, cócteles y postres.',
  },
] as const;

export const PROGRAMAR_MENUS_WEEK_EXAMPLES = [
  'Menú ejecutivo de lunes a viernes.',
  'Brunch de sábados y domingos.',
  'Carta de vinos los viernes y sábados por la noche.',
  'Happy hour de miércoles a viernes.',
  'Menú familiar los domingos.',
  'Carta especial durante eventos.',
  'Menú de temporada durante un periodo concreto, cuando la configuración disponible lo permita.',
] as const;

export const PROGRAMAR_MENUS_STEPS = [
  {
    title: 'Crea los menús de tu restaurante',
    body: 'Prepara las cartas que quieras utilizar, como desayunos, almuerzos, cenas o promociones.',
    mediaHint: 'Creación de menús del restaurante',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif' as string | null,
    imageAlt: 'Formulario para crear o editar productos del menú',
  },
  {
    title: 'Selecciona el menú que quieres programar',
    body: 'Accede a la configuración de programación y elige una de las cartas disponibles.',
    mediaHint: 'Selección del menú a programar',
    image: '/funciones/programar-menus/paso-selecciona-menu.avif' as string | null,
    imageAlt:
      'Carta especial con programación de visibilidad y días de la semana seleccionados',
  },
  {
    title: 'Define los días',
    body: 'Indica si estará disponible todos los días o selecciona días concretos de la semana.',
    mediaHint: 'Selección de días de la semana',
    image: '/funciones/programar-menus/paso-define-dias.avif' as string | null,
    imageAlt: 'Opción para limitar la programación por fechas con calendario',
  },
  {
    title: 'Configura el horario',
    body: 'Añade la hora de inicio y la hora de finalización.',
    mediaHint: 'Horario de inicio y finalización',
    image: '/funciones/programar-menus/paso-configura-horario.avif' as string | null,
    imageAlt: 'Campos de horario Desde y Hasta para la disponibilidad del menú',
  },
  {
    title: 'Guarda y revisa la programación',
    body: 'Comprueba la configuración y verifica cómo se comporta la carta dentro y fuera del horario seleccionado.',
    mediaHint: 'Revisión de la carta programada',
    image: '/funciones/programar-menus/paso-guarda-revisa.avif' as string | null,
    imageAlt: 'Menú digital de La Parrilla de Pocho en el móvil tras escanear el QR',
  },
] as const;

export const PROGRAMAR_MENUS_USE_CASES = [
  'Restaurantes con desayuno, almuerzo y cena.',
  'Cafeterías.',
  'Hoteles.',
  'Bares.',
  'Restaurantes de playa.',
  'Locales con happy hour.',
  'Negocios con menú ejecutivo.',
  'Restaurantes con brunch de fin de semana.',
  'Establecimientos con carta nocturna.',
  'Comedores y centros con franjas de servicio.',
  'Restaurantes con diferentes propuestas según el día.',
] as const;

export const PROGRAMAR_MENUS_BENEFITS = [
  {
    title: 'Ahorra tiempo',
    body: 'Evita activar y desactivar manualmente las cartas cada día.',
  },
  {
    title: 'Reduce errores',
    body: 'Disminuye el riesgo de mostrar un menú fuera de horario o durante un día incorrecto.',
  },
  {
    title: 'Mantén la oferta organizada',
    body: 'Separa desayunos, almuerzos, cenas y promociones en menús diferentes.',
  },
  {
    title: 'Mejora la experiencia del cliente',
    body: 'Muestra solamente la carta que corresponde al momento de la consulta.',
  },
  {
    title: 'Utiliza siempre el mismo QR',
    body: 'Gestiona diferentes menús sin cambiar los códigos colocados en las mesas.',
  },
  {
    title: 'Adapta la carta a tu operativa',
    body: 'Configura horarios diarios o días concretos según el funcionamiento real del negocio.',
  },
  {
    title: 'Reduce tareas durante el servicio',
    body: 'Permite que el personal se concentre en la atención y no en actualizar manualmente la carta.',
  },
] as const;

export const PROGRAMAR_MENUS_MANAGE_ACTIONS = [
  'Cambiar la hora de inicio.',
  'Modificar la hora de finalización.',
  'Añadir o quitar días.',
  'Pasar de una programación diaria a días concretos.',
  'Desactivar temporalmente una programación.',
  'Seleccionar otro menú.',
  'Revisar qué carta está programada para cada franja.',
] as const;

export const PROGRAMAR_MENUS_BEST_PRACTICES = [
  'Evita que dos menús programados se superpongan si la aplicación no establece una prioridad automática.',
  'Revisa los horarios de apertura y cierre.',
  'Comprueba la zona horaria configurada para el restaurante.',
  'Utiliza nombres claros para identificar cada menú.',
  'Prueba el QR antes del inicio de cada nueva programación.',
  'Mantén actualizados los productos de cada carta.',
  'Revisa los horarios cuando cambie la temporada.',
  'Desactiva programaciones que ya no se utilicen.',
] as const;

export type RelatedProgramarMenusCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const PROGRAMAR_MENUS_RELATED: RelatedProgramarMenusCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Menú QR dinámico',
    body: 'Actualiza productos, precios e imágenes manteniendo siempre el mismo código QR.',
    linkLabel: 'Crear un menú QR dinámico',
  },
  {
    slug: 'menu-multidioma',
    title: 'Menú multidioma',
    body: 'Muestra cada menú programado en diferentes idiomas.',
    linkLabel: 'Crear un menú multidioma',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Menú con alérgenos',
    body: 'Incluye la información alimentaria dentro de cada carta.',
    linkLabel: 'Crear un menú con alérgenos',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Gestionar productos',
    body: 'Activa, desactiva y destaca productos según la disponibilidad.',
    linkLabel: 'Desactivar y destacar productos',
  },
  {
    slug: 'imprimir-menu',
    title: 'Imprimir menú',
    body: 'Crea una versión impresa de las cartas que utilizas en tu restaurante.',
    linkLabel: 'Crear una versión para imprimir',
  },
];
