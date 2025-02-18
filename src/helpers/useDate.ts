/**
 * convertDateToDDMMYY
 * @param date string
 * @returns string
 */
export function convertDateToDDMMYY(date: string): string {
  const [year, month, day] = date.split("-").map(Number); // Split the date by dashes
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedYear = String(year).slice(2);

  return `${formattedDay}${formattedMonth}${formattedYear}`; // Format DDMMYY
}

/**
 * formatRequestDate
 * @param date Date
 * @returns string
 */
export const formatRequestDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * formatToHumanReadableDate
 * @param dateTime string
 * @param withTime boolean
 * @returns string
 */
export function formatToHumanReadableDate(dateTime: string, withTime: boolean = false): string {
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ];

  const dateObj = new Date(dateTime);
  const dayOfWeek = daysOfWeek[dateObj.getDay()];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  const formattedHours = hours < 10 ? '0' + hours : hours;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  if (withTime) {
    return `${dayOfWeek} ${day} de ${month}, ${year} a las ${formattedHours}:${formattedMinutes}`;
  }

  return `${dayOfWeek} ${day} de ${month}, ${year}`;
}

/**
 * getFormattedCurrentTime
 * @returns string
 */
export function getFormattedCurrentTime(): string {
  const date = new Date();
  
  // Obtener la hora y minutos
  const hours: number = date.getHours();
  const minutes: number = date.getMinutes();
  
  // Añadir un cero inicial a los minutos si es menor a 10
  const formattedMinutes: string = minutes < 10 ? '0' + minutes : minutes.toString();
  
  return `Hoy a las ${hours}:${formattedMinutes} horas`;
}
