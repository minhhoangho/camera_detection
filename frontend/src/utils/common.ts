import round from 'lodash/round';
import momentTimezone from 'moment-timezone';
import moment from 'moment';
import take from 'lodash/take';
import isEmpty from 'lodash/isEmpty';
import { nanoid } from 'nanoid';
import { EventEmitter } from 'eventemitter3';
import {
  CLOUD_FRONT,
  ENV,
  FE_URL,
  START_DATE_OF_WEEKS,
  StorageKey,
  TIMEZONE,
} from 'src/constants';

const getHostnameFromRegex = (url: string) => {
  // run against regex
  const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
  // extract hostname (will be null if no match is found)
  return matches?.[1] ?? '';
};

function isLocalhost() {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'
  ); // For IPv6
}

export function getCurrentDomain() {
  if (isLocalhost()) return window.location.hostname;

  const parts = getHostnameFromRegex(FE_URL).replace(/:\d*/g, '').split('.');

  parts.shift();
  return parts.join('.');
}

export function mapCloudFrontURL(uri: string) {
  if (!uri || typeof uri !== 'string' || uri.startsWith('http')) return uri;
  return `${CLOUD_FRONT}${uri}`;
}

export function momentServerTimezone(...args: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const momentLang = momentTimezone(...args);
  momentLang.tz(TIMEZONE.HO_CHI_MINH);

  return momentLang;
}

export function renderInitialVisibleMonth(date: string) {
  return date ? moment(date) : momentLanguage();
}

export function momentLanguage(...args: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const momentLang = momentTimezone(...args);
  const language = getDefaultLanguage();
  const timezone = getUserTimezone();
  momentLang.locale(language);
  momentLang.tz(timezone);

  return momentLang;
}

export function getDefaultLanguage(): string {
  return (UserStorage.getCurrentInfo()['lang'] as string) ?? '';
}

export function getUserTimezone(): string {
  const currentUser = UserStorage.getCurrentInfo();
  return (currentUser && (currentUser['timezone'] as string)) || '';
}

export const UserStorage = {
  getCurrentInfo() {
    const user = global.sessionStorage?.getItem(StorageKey.CurrentUser);
    return user ? (JSON.parse(user) as Record<string, any>) : {};
  },
};

export const navigateTo = (url: string) => (window.location.href = url);

export const getMemberFullName = (
  firstName = '',
  lastName = '',
  middleName = '',
) => [firstName, middleName, lastName].join(' ');

export const downloadText = (fileName: string, data: BlobPart) => {
  const element = document.createElement('a');
  const file = new Blob([data], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
};

export const isProductionEnvironment = () => ['production'].includes(ENV);

export const emptyFunction = () => {
  // This is intentional
};

export const mapEmailToKey = (email: string) => email.replaceAll('.', '*');

export const mapKeyToEmail = (email: string) => email.replaceAll('*', '.');

export const canvasToFile = (canvas: HTMLCanvasElement, name: string) =>
  new Promise((resolve) => {
    canvas.toBlob((blob: Blob | null): void => {
      blob = blob ?? new Blob();
      const file = new File(
        [blob],
        name ? `${name}.png` : `image-${nanoid()}.png`,
        { type: blob.type },
      );
      resolve({
        file,
        url: window.URL.createObjectURL(blob),
      });
    });
  });

export const getFileName = (fileName: string) => {
  if (fileName) {
    const name = fileName.split('.');
    name.pop();
    return name.join('.');
  }
  return '';
};

export const mergeBy = (array: any[], values: any[], key: string): any[] => {
  if (isEmpty(values) || isEmpty(array)) {
    return [...array];
  }

  return [
    ...values
      .concat([...array])
      .reduce(
        (m, o) => m.set(o[key], Object.assign(m.get(o[key]) || {}, o)),
        new Map(),
      )
      .values(),
  ];
};

export const getSuggestEmail = (str: string) => {
  const words: string[] = normalizeString(str).split(' ');
  return `${words.shift() ?? ''}${words
    .map((word) => word?.[0])
    .filter((character) => !!character)
    .join('')}`;
};

export const getStringFirstCharacters = (str: string) =>
  normalizeString(str)
    .split(' ')
    .map((word) => word?.[0])
    .filter((character) => !!character)
    .join('');

export const normalizeString = (str: string) =>
  str
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replaceAll('  ', ' ');

export function getTextWidth(text: string, font: string) {
  const canvas = document.createElement('canvas');
  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

  if (context) {
    context.font = font || getComputedStyle(document.body).font;
  }

  const width = context?.measureText(text).width;
  canvas.remove();
  return width;
}

export const formatResourceTimeRange = (weeks: number) => {
  const year = Math.floor(weeks / 48);
  const month = Math.floor((weeks - year * 48) / 4);
  const week = weeks - year * 48 - month * 4;
  return {
    year,
    month,
    week,
  };
};

export const prettifyErrorCode = (errorCode: string) =>
  take(errorCode.split('-'), 2).join('-');

export const getElementPosition = (element: Element) => {
  const { top, bottom, left, right } = element?.getBoundingClientRect() || {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  return {
    top,
    bottom: window.innerHeight - bottom,
    left,
    right: window.innerWidth - right,
  };
};

export const getPreviousWeekStartDate = (current: moment.Moment) => {
  const day = +current.format('DD');
  if ([14, 21].includes(day)) return current.subtract(7, 'days');
  if (day === 7) {
    const result = current.subtract(1, 'month');
    return result.set('date', +result.endOf('month').format('DD'));
  }
  return current.set('date', 21);
};

export const getNextWeekStartDate = (current: moment.Moment) => {
  const day = +current.format('DD');
  if ([7, 14].includes(day)) return current.add(7, 'days');
  if ([21].includes(day))
    return current.add(1, 'month').set('date', 1).subtract(1, 'days');
  return current.add(1, 'month').set('date', 7);
};

export const shiftDateByNumWeek = (
  current: string | moment.Moment,
  numWeek: number,
) => {
  let result = moment(current);
  for (let i = 0; i < numWeek; i++) result = getNextWeekStartDate(result);
  return result.toISOString();
};

export const unshiftDateByNumWeek = (
  current: string | moment.Moment,
  numWeek: number,
) => {
  let result = moment(current);
  for (let i = 0; i < numWeek; i++) result = getPreviousWeekStartDate(result);
  return result.toISOString();
};

export const getStartDateOfWeek = (date: string | moment.Moment) => {
  const startOfDay = momentServerTimezone(date).startOf('day');
  const weekIndex: number = Math.floor(
    (Math.min(startOfDay.date(), 28) - 1) / 7 + 1,
  );
  return momentServerTimezone(startOfDay).set(
    'date',
    START_DATE_OF_WEEKS[weekIndex - 1] ?? 0,
  );
};

export const getTotalWeeks = (
  from: moment.Moment,
  to: moment.Moment,
): number => {
  if (moment(from).isAfter(moment(to))) {
    return 2 - getTotalWeeks(to, from);
  }
  const startDate = getStartDateOfWeek(from);
  const startMonth = momentServerTimezone(startDate).startOf('month');
  const endDate = getStartDateOfWeek(to);
  const endMonth = momentServerTimezone(endDate).endOf('month');
  return (
    4 -
    Math.ceil((Math.min(startDate.date(), 28) - 1) / 7) +
    (Math.ceil((Math.min(endDate.date(), 28) - 1) / 7) + 1) +
    (endMonth.diff(startMonth, 'months') - 1) * 4
  );
};

export const compareDate = (
  value1: string | moment.Moment,
  value2: string | moment.Moment,
) => {
  const date1 = moment(value1);
  const date2 = moment(value2);
  if (date1.isBefore(date2)) return -1;
  if (date1.isAfter(date2)) return 1;
  return 0;
};

export const emitter = new EventEmitter();

export const commonPaginationInfo = (
  paginate: {
    total: number;
    offset: number;
  },
  limit: number,
): string => `${paginate.total} items 
  ${paginate.offset + 1}~
  ${
    paginate.offset + limit > paginate.total
      ? paginate.total
      : paginate.offset + limit
  } total`;

export const lengthJanpanese = (str: string): number => {
  let r = 0;
  for (let i = 0; i < str.length; i += 1) {
    const c = str.charCodeAt(i);
    // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
    // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
    if (
      (c >= 0x0 && c < 0x81) ||
      c === 0xf8f0 ||
      (c >= 0xff61 && c < 0xffa0) ||
      (c >= 0xf8f1 && c < 0xf8f4)
    ) {
      r += 1;
    } else {
      r += 2;
    }
  }
  return r;
};

export const isHalfWidth = (str: string): boolean => {
  let r = 0;
  for (let i = 0; i < str.length; i += 1) {
    const c = str.charCodeAt(i);
    // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
    // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
    if (
      (c >= 0x0 && c < 0x81) ||
      c === 0xf8f0 ||
      (c >= 0xff61 && c < 0xffa0) ||
      (c >= 0xf8f1 && c < 0xf8f4)
    ) {
      r += 1;
    } else {
      return false;
    }
  }
  if (r !== str.length) return false;
  return true;
};
export const convertObjectToBase64 = (obj: Record<string, any>): string => {
  const json = JSON.stringify(obj);
  return encodeURIComponent(json);
};

export const convertBase64ToObject = (
  str: string,
  callback?: () => null,
): Record<string, any> => {
  try {
    const json = decodeURIComponent(str);
    return JSON.parse(json);
  } catch (error) {
    callback?.();
    return {
      error,
    };
  }
};

export const getNewUrlQuery = (
  baseQuery: string | string[],
  mappingObject: Record<string, any>,
): string => {
  const oldQuery = baseQuery
    ? convertBase64ToObject(baseQuery as string)
    : null;
  return convertObjectToBase64({ ...oldQuery, ...mappingObject });
};

export const handleScrollToBottom = (
  target: HTMLElement,
  callback: () => void,
): void => {
  try {
    const { scrollHeight, scrollTop, clientHeight } = target;
    const buffer = scrollHeight - (scrollTop + clientHeight);
    if (buffer <= 0) {
      callback();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

export const getPercent = (num: number): string => `${round(num * 100, 2)}%`;

export function isEmptyMatrix(matrix: Array<Array<any>>): boolean {
  return (
    _.isEmpty(matrix) ||
    matrix.length === 0 ||
    _.every(matrix, (row) => _.isEmpty(row))
  );
}
