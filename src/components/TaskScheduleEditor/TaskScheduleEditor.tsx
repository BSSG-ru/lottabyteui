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
import { FieldDateEditor } from '../FieldDateEditor';
import styles from './TaskScheduleEditor.module.scss';
import Moment from 'moment';

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
  const [runDate, setRunDate] = useState<Date|null>(null);
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
    setScheduleType(defaultScheduleType ?? '');
  }, [defaultScheduleType]);

  const getScheduleTypeObjects = async (search: string) => [
    { id: 'ONCE', name: i18n('Однократно') },
    { id: 'DAILY', name: i18n('Ежедневно') },
    { id: 'WEEKLY', name: i18n('Еженедельно') },
    { id: 'MONTHLY', name: i18n('Ежемесячно') },
//    { id: 'CRON', name: i18n('CRON') },
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

        if (json.datetime) {
          const d = new Date(json.datetime);

          setRunDate(d);
          
        }
      }
    }
  }, [scheduleType, defaultScheduleParams]);

  useEffect(() => {
    let params = {};

    if (runDate) {
      params = {
        datetime: `${runDate.toISOString().replace('T', ' ').replace('Z', '')}`,
      };
    }

    const newValue = {
      schedule_type: scheduleType,
      schedule_params: typeof params === 'string' ? params : JSON.stringify(params),
    };
    setValue(newValue);
    onChanged(newValue);
  }, [runDate, scheduleType]);

  const getMonthDayObjects = async (search: string) => {
    const arr = [];
    for (let i = 1; i <= 31; i += 1) arr.push({ id: i, name: i.toString() });
    return arr.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  };

  return (
    <>

      <div>
        <div className={styles.label}>{i18n('Расписание выполнения')}</div>
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
      </div>
      <div>
        <FieldDateEditor label={i18n('Запуск')} defaultValue={runDate ? Moment(runDate).add(-3, 'hours').toDate() : runDate} valueSubmitted={(v) => {
          setRunDate(v);
          setDataModified(true);
        }} />
      </div>      
      
    </>
  );
};
