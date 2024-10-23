import dayjs from 'dayjs';

export const formatDateForDisplay = (date) => {
    const dayjsDate = dayjs(date);
    return dayjsDate.isValid() ? dayjsDate.format('DD/MM/YYYY') : "";
};

export const formatDateForServer = (date) => {
    const dayjsDate = dayjs(date, 'DD/MM/YYYY');
    return dayjsDate.isValid() ? dayjsDate.format('YYYY-MM-DDTHH:mm:ss') : "";
};