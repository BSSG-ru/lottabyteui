/* eslint-disable radix */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */
import React, { FC, useEffect, useState } from 'react';
import { i18n, setDataModified } from '../../utils';
import { Autocomplete } from '../Autocomplete';
import { Input } from '../Input';
import styles from './TaskScheduleEditor.module.scss';

export type TaskScheduleEditorProps = {
  className?: string;
  isReadOnly?: boolean;
  defaultScheduleType?: string;
  defaultScheduleParams?: string;
  onChanged: (value: TaskScheduleEditorValue) => void;
};

export type TaskScheduleEditorValue = {
  schedule_type: string;
  schedule_params: string;
};

export const TaskScheduleEditor: FC<TaskScheduleEditorProps> = ({
  className,
  isReadOnly,
  defaultScheduleType,
  defaultScheduleParams,
  onChanged,
}) => {
  const [value, setValue] = useState<TaskScheduleEditorValue>({
    schedule_type: '',
    schedule_params: '',
  });
  const [scheduleType, setScheduleType] = useState('');
  const [scheduleTypeName, setScheduleTypeName] = useState('');
  const [runDate, setRunDate] = useState('');
  const [runHours, setRunHours] = useState(0);
  const [runMins, setRunMins] = useState(0);
  const [runWeekDay, setRunWeekDay] = useState(0);
  const [runWeekDayName, setRunWeekDayName] = useState('');
  const [runMonthDay, setRunMonthDay] = useState(0);
  const [cronParams, setCronParams] = useState('');

  const padTimeComponent = (x: string | number) => `00${x}`.slice(-2);

  const getWeekDayObjects = async (search: string) => [
    { id: 1, name: i18n('Понедельник') },
    { id: 2, name: i18n('Вторник') },
    { id: 3, name: i18n('Среда') },
    { id: 4, name: i18n('Четверг') },
    { id: 5, name: i18n('Пятница') },
    { id: 6, name: i18n('Суббота') },
    { id: 7, name: i18n('Воскресенье') },
  ].filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);

  useEffect(() => {
    getWeekDayObjects('').then((items) => {
      const el = items.find((x) => x.id === runWeekDay);
      setRunWeekDayName(el ? el.name : '');
    });
  }, [runWeekDay]);

  useEffect(() => {
    setScheduleType(defaultScheduleType ?? '');
  }, [defaultScheduleType]);

  const getScheduleTypeObjects = async (search: string) => [
    { id: 'ONCE', name: i18n('Однократно') },
    { id: 'DAILY', name: i18n('Ежедневно') },
    { id: 'WEEKLY', name: i18n('Еженедельно') },
    { id: 'MONTHLY', name: i18n('Ежемесячно') },
    { id: 'CRON', name: i18n('CRON') },
  ].filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);

  useEffect(() => {
    getScheduleTypeObjects('').then((items) => {
      const el = items.find((x) => x.id === scheduleType);
      setScheduleTypeName(el ? el.name : '');
    });
  }, [scheduleType]);

  useEffect(() => {
    if (scheduleType === 'CRON') setCronParams(defaultScheduleParams ?? '');
    else {
      setCronParams('');

      if (defaultScheduleParams) {
        const json = JSON.parse(defaultScheduleParams);

        switch (scheduleType) {
          case 'ONCE':
            if (json.datetime) {
              const d = new Date(json.datetime);

              setRunDate(d.toISOString().substring(0, 10));
              setRunHours(d.getHours());
              setRunMins(d.getMinutes());
            }
            break;
          case 'DAILY':
            if (json.time) {
              const parts = json.time.split(':');
              if (parts.length > 1) {
                setRunHours(parts[0]);
                setRunMins(parts[1]);
              }
            }
            break;
          case 'WEEKLY':
            if (json.dow) setRunWeekDay(json.dow);
            if (json.time) {
              const parts = json.time.split(':');
              if (parts.length > 1) {
                setRunHours(parts[0]);
                setRunMins(parts[1]);
              }
            }
            break;
          case 'MONTHLY':
            if (json.dom) setRunMonthDay(json.dom);
            if (json.time) {
              const parts = json.time.split(':');
              if (parts.length > 1) {
                setRunHours(parts[0]);
                setRunMins(parts[1]);
              }
            }
            break;
        }
      }
    }
  }, [scheduleType, defaultScheduleParams]);

  useEffect(() => {
    let params = {};

    switch (scheduleType) {
      case 'ONCE':
        if (runDate) {
          params = {
            datetime: `${runDate} ${padTimeComponent(runHours)}:${padTimeComponent(runMins)}:00`,
          };
        }
        break;
      case 'DAILY':
        params = {
          time: `${padTimeComponent(runHours)}:${padTimeComponent(runMins)}:00`,
        };
        break;
      case 'WEEKLY':
        params = {
          dow: runWeekDay,
          time: `${padTimeComponent(runHours)}:${padTimeComponent(runMins)}:00`,
        };
        break;
      case 'MONTHLY':
        params = {
          dom: runMonthDay,
          time: `${padTimeComponent(runHours)}:${padTimeComponent(runMins)}:00`,
        };
        break;
      case 'CRON':
        params = cronParams;
    }
    const newValue = {
      schedule_type: scheduleType,
      schedule_params: typeof params === 'string' ? params : JSON.stringify(params),
    };
    setValue(newValue);
    onChanged(newValue);
  }, [runDate, runHours, runMins, runWeekDay, runMonthDay, cronParams, scheduleType]);

  const getMonthDayObjects = async (search: string) => {
    const arr = [];
    for (let i = 1; i <= 31; i += 1) arr.push({ id: i, name: i.toString() });
    return arr.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  };

  return (
    <>
      <tr>
        <th>{i18n('Расписание выполнения')}</th>
        <td>
          <Autocomplete
            defaultOptions
            getOptions={getScheduleTypeObjects}
            defaultValue={scheduleType}
            inputValue={scheduleTypeName}
            onChanged={(data: any) => {
              setScheduleType(data.id);
              setDataModified(true);
            }}
          />
        </td>
      </tr>
      {scheduleType === 'ONCE' && (
        <tr className={styles.tr_date}>
          <th />
          <td>
            <label>{i18n('Дата вызова')}</label>
            <Input
              type="date"
              value={runDate}
              onChange={(e) => {
                setRunDate(e.target.value);
                setDataModified(true);
              }}
            />
          </td>
        </tr>
      )}
      {scheduleType === 'WEEKLY' && (
        <tr className={styles.tr_wday}>
          <th />
          <td>
            <label>{i18n('День недели')}</label>
            <Autocomplete
              defaultOptions
              getOptions={getWeekDayObjects}
              defaultValue={runWeekDay.toString()}
              inputValue={runWeekDayName}
              onChanged={(data: any) => {
                setRunWeekDay(data.id);
                setDataModified(true);
              }}
            />
          </td>
        </tr>
      )}
      {scheduleType === 'MONTHLY' && (
        <tr className={styles.tr_wday}>
          <th />
          <td>
            <label>{i18n('День')}</label>
            <Autocomplete
              defaultOptions
              getOptions={getMonthDayObjects}
              defaultValue={runMonthDay.toString()}
              inputValue={runMonthDay.toString()}
              onChanged={(data: any) => {
                setRunMonthDay(data.id);
                setDataModified(true);
              }}
            />
          </td>
        </tr>
      )}
      {['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(scheduleType) && (
        <tr className={styles.tr_time}>
          <th>
            <label>{/* i18n('Время вызова') */}</label>
          </th>
          <td>
            <label>{i18n('Часов')}</label>
            <Input
              className={styles.input_num}
              type="number"
              value={runHours.toString()}
              onChange={(e) => {
                setRunHours(parseInt(e.target.value));
                setDataModified(true);
              }}
            />
            <label>{i18n('Минут')}</label>
            <Input
              className={styles.input_num}
              type="number"
              value={runMins.toString()}
              onChange={(e) => {
                setRunMins(parseInt(e.target.value));
                setDataModified(true);
              }}
            />
          </td>
        </tr>
      )}
      {scheduleType === 'CRON' && (
        <tr className={styles.tr_cron}>
          <th />
          <td>
            <label>{i18n('CRON')}</label>
            <Input
              value={cronParams}
              onChange={(e) => {
                setCronParams(e.target.value);
                setDataModified(true);
              }}
            />
          </td>
        </tr>
      )}
    </>
  );
};
