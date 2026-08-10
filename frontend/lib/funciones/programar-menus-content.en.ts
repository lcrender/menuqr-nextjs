import { type FuncionesSlug } from '../funciones-nav';

export const PROGRAMAR_MENUS_PATH = '/en/features/schedule-menus' as const;

/**
 * Media: reuses existing screenshots where applicable; null = placeholder.
 * Replace with dedicated assets under /funciones/programar-menus/ when ready.
 */
export const PROGRAMAR_MENUS_MEDIA = {
  /** Hero YouTube: https://youtu.be/1YOvNx1fVpc */
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
  title: 'Schedule Menus by Day and Time | Digital Menu',
  description:
    'Schedule your restaurant menus by day and time. Automatically show breakfast, lunch, dinner, or promotions with the same QR code.',
} as const;

export type ProgramarMenusFaqItem = { question: string; answer: string };

export const PROGRAMAR_MENUS_FAQ: ProgramarMenusFaqItem[] = [
  {
    question: 'Can I schedule a menu to appear every day?',
    answer:
      'Yes. You can select the menu and set a time window that repeats every day.',
  },
  {
    question: 'Can I show a menu only on certain days?',
    answer:
      'Yes. You can pick specific days of the week and set a start and end time.',
  },
  {
    question: 'Do I need a different QR code for each menu?',
    answer:
      'No. Guests can use the same QR code and see the menu available for that day and time.',
  },
  {
    question: 'Can I schedule a breakfast menu and a dinner menu?',
    answer:
      'Yes. You can create both menus and configure a different time window for each.',
  },
  {
    question: 'Can I change the hours after saving the schedule?',
    answer: 'Yes. You can edit days and times from the admin panel.',
  },
  {
    question: 'What happens outside the scheduled hours?',
    answer:
      'The menu is no longer available outside the configured window. What guests see depends on the other active or scheduled menus for the restaurant.',
  },
  {
    question: 'Can I schedule a menu for weekends only?',
    answer:
      'Yes. You can select Saturday and Sunday and set the hours when it should appear.',
  },
  {
    question: 'Can I schedule individual products?',
    answer:
      'Scheduling applies to full menus. Products are managed inside each menu.',
  },
  {
    question: 'Can I use scheduling for a happy hour?',
    answer:
      'Yes. You can create a menu for the promotion and show it only on the matching days and hours.',
  },
  {
    question: 'Do guests need to install an app?',
    answer: 'No. They view the menu directly in the phone’s browser.',
  },
  {
    question: 'Can I temporarily turn off a schedule?',
    answer:
      'Yes. You can disable a menu’s schedule from the panel without deleting the menu. You can also change its days or hours.',
  },
  {
    question: 'What if two menus have overlapping hours?',
    answer:
      'If two scheduled menus overlap, both can appear as available. To avoid confusion, review the setup and try to keep the windows from overlapping.',
  },
];

export const PROGRAMAR_MENUS_MOMENT_BENEFITS = [
  'Different menus for different times of day.',
  'Scheduling for every day or specific days.',
  'Start and end times.',
  'The same QR code for every menu.',
  'Fewer manual changes.',
  'More control over the offer.',
  'A clearer experience for guests.',
] as const;

export const PROGRAMAR_MENUS_COMPARE_MANUAL = [
  'Turning menus on and off every day.',
  'Remembering the hours for each menu.',
  'Risk of showing a menu outside its hours.',
  'Repetitive changes during the day.',
  'More dependence on staff.',
] as const;

export const PROGRAMAR_MENUS_COMPARE_SCHEDULED = [
  'Days and hours set in advance.',
  'Automatic activation.',
  'The same QR code.',
  'The right menu at the right time.',
  'Fewer manual tasks.',
] as const;

export const PROGRAMAR_MENUS_MODE_EVERY_DAY = [
  'Breakfast every day from 8:00 AM to 12:00 PM.',
  'Lunch menu every day from 12:00 PM to 4:00 PM.',
  'Evening menu every day from 7:00 PM to 11:30 PM.',
] as const;

export const PROGRAMAR_MENUS_MODE_SOME_DAYS = [
  'Lunch special Monday through Friday from 12:00 PM to 4:00 PM.',
  'Brunch Saturday and Sunday from 10:00 AM to 3:00 PM.',
  'Happy hour Wednesday through Friday from 6:00 PM to 8:00 PM.',
  'Special menu Friday and Saturday nights.',
] as const;

export const PROGRAMAR_MENUS_HOW_POINTS = [
  {
    title: 'Select the menu',
    body: 'Choose the menu you want to schedule from the ones created for your restaurant. It can be breakfast, lunch, dinner, drinks, promotions, or any other offer.',
  },
  {
    title: 'Choose the days',
    body: 'Indicate whether the menu is available every day or pick specific days of the week.',
  },
  {
    title: 'Set the hours',
    body: 'Add a start time and an end time to control when the menu is shown.',
  },
  {
    title: 'Save the schedule',
    body: 'Once configured, the schedule is linked to the menu and starts applying automatically.',
  },
  {
    title: 'Change the schedule whenever you need',
    body: 'You can change days, extend hours, shorten the window, or temporarily disable the schedule from the panel.',
  },
] as const;

export const PROGRAMAR_MENUS_SAME_QR_EXAMPLES = [
  'At 9:00 AM, a guest scans the QR and sees the breakfast menu.',
  'At 1:00 PM, the same code shows the lunch special.',
  'At 8:00 PM, the guest opens the dinner menu.',
] as const;

export const PROGRAMAR_MENUS_DAY_SLOTS = [
  {
    title: 'Breakfast',
    schedule: 'Every day from 8:00 AM to 12:00 PM.',
    body: 'Coffee, teas, toast, pastries, bowls, and breakfast options.',
  },
  {
    title: 'Lunch',
    schedule: 'Every day from 12:00 PM to 4:00 PM.',
    body: 'Starters, mains, lunch specials, drinks, and desserts.',
  },
  {
    title: 'Afternoon',
    schedule: 'Every day from 4:00 PM to 7:00 PM.',
    body: 'Café items, pastries, cold drinks, and shareable options.',
  },
  {
    title: 'Dinner',
    schedule: 'Every day from 7:00 PM until close.',
    body: 'Full menu, specials, wines, cocktails, and desserts.',
  },
] as const;

export const PROGRAMAR_MENUS_WEEK_EXAMPLES = [
  'Lunch special Monday through Friday.',
  'Brunch on Saturday and Sunday.',
  'Wine list Friday and Saturday nights.',
  'Happy hour Wednesday through Friday.',
  'Family menu on Sundays.',
  'Special menu during events.',
  'Seasonal menu for a set period, when available settings allow it.',
] as const;

export const PROGRAMAR_MENUS_STEPS = [
  {
    title: 'Create your restaurant’s menus',
    body: 'Prepare the menus you want to use, such as breakfast, lunch, dinner, or promotions.',
    mediaHint: 'Creating restaurant menus',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif' as string | null,
    imageAlt: 'Form to create or edit menu products',
  },
  {
    title: 'Select the menu to schedule',
    body: 'Open the schedule settings and choose one of the available menus.',
    mediaHint: 'Selecting the menu to schedule',
    image: '/funciones/programar-menus/paso-selecciona-menu.avif' as string | null,
    imageAlt:
      'Special menu with visibility schedule and selected days of the week',
  },
  {
    title: 'Set the days',
    body: 'Indicate whether it’s available every day or pick specific days of the week.',
    mediaHint: 'Selecting days of the week',
    image: '/funciones/programar-menus/paso-define-dias.avif' as string | null,
    imageAlt: 'Option to limit the schedule by dates with a calendar',
  },
  {
    title: 'Configure the hours',
    body: 'Add the start time and end time.',
    mediaHint: 'Start and end times',
    image: '/funciones/programar-menus/paso-configura-horario.avif' as string | null,
    imageAlt: 'From and To time fields for menu availability',
  },
  {
    title: 'Save and review the schedule',
    body: 'Check the setup and verify how the menu behaves inside and outside the selected hours.',
    mediaHint: 'Reviewing the scheduled menu',
    image: '/funciones/programar-menus/paso-guarda-revisa.avif' as string | null,
    imageAlt: 'La Parrilla de Pocho digital menu on mobile after scanning the QR',
  },
] as const;

export const PROGRAMAR_MENUS_USE_CASES = [
  'Restaurants with breakfast, lunch, and dinner.',
  'Cafés.',
  'Hotels.',
  'Bars.',
  'Beach restaurants.',
  'Venues with happy hour.',
  'Businesses with a lunch special.',
  'Restaurants with weekend brunch.',
  'Venues with a late-night menu.',
  'Dining halls and centers with service windows.',
  'Restaurants with different offers by day.',
] as const;

export const PROGRAMAR_MENUS_BENEFITS = [
  {
    title: 'Save time',
    body: 'Avoid turning menus on and off manually every day.',
  },
  {
    title: 'Fewer mistakes',
    body: 'Lower the risk of showing a menu outside its hours or on the wrong day.',
  },
  {
    title: 'Keep the offer organized',
    body: 'Separate breakfast, lunch, dinner, and promotions into different menus.',
  },
  {
    title: 'A better guest experience',
    body: 'Show only the menu that matches the moment they open it.',
  },
  {
    title: 'Always use the same QR',
    body: 'Manage different menus without changing the codes on the tables.',
  },
  {
    title: 'Fit the menu to your operations',
    body: 'Set daily hours or specific days based on how the business actually runs.',
  },
  {
    title: 'Fewer tasks during service',
    body: 'Let staff focus on guests instead of updating the menu by hand.',
  },
] as const;

export const PROGRAMAR_MENUS_MANAGE_ACTIONS = [
  'Change the start time.',
  'Edit the end time.',
  'Add or remove days.',
  'Switch from every-day scheduling to specific days.',
  'Temporarily disable a schedule.',
  'Select a different menu.',
  'Review which menu is scheduled for each window.',
] as const;

export const PROGRAMAR_MENUS_BEST_PRACTICES = [
  'Avoid overlapping scheduled menus if the app doesn’t set an automatic priority.',
  'Review opening and closing hours.',
  'Check the time zone configured for the restaurant.',
  'Use clear names to identify each menu.',
  'Test the QR before each new schedule starts.',
  'Keep the products on each menu up to date.',
  'Review hours when the season changes.',
  'Disable schedules that are no longer used.',
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
    title: 'Dynamic QR menu',
    body: 'Update products, prices, and images while always keeping the same QR code.',
    linkLabel: 'Create a dynamic QR menu',
  },
  {
    slug: 'menu-multidioma',
    title: 'Multilingual menu',
    body: 'Show each scheduled menu in different languages.',
    linkLabel: 'Create a multilingual menu',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Allergen menu',
    body: 'Include dietary information inside each menu.',
    linkLabel: 'Create an allergen menu',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Manage products',
    body: 'Enable, disable, and feature products based on availability.',
    linkLabel: 'Disable and feature products',
  },
  {
    slug: 'imprimir-menu',
    title: 'Print menu',
    body: 'Create a printed version of the menus you use in your restaurant.',
    linkLabel: 'Create a printable version',
  },
];
