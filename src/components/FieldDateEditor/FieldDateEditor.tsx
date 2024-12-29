import classNames from 'classnames';
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { setDataModified } from '../../utils';
import styles from './FieldDateEditor.module.scss';
import DatePicker, { registerLocale } from "react-datepicker";
import Moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";

import { ru } from 'date-fns/locale/ru';
registerLocale('ru', ru)

export type FieldDateEditorProps = {
    className?: string;
    isReadOnly?: boolean;
    isRequired?: boolean;
    showValidation?: boolean;
    label?: string;
    id?: string;
    defaultValue: Date | null;
    valueSubmitted: (value: Date | null) => void;
};

export const FieldDateEditor: FC<FieldDateEditorProps> = ({
    className = '', isReadOnly, isRequired, showValidation, label, defaultValue, valueSubmitted, id = ''
}) => {

    const [value, setValue] = useState<Date|null>(null);

    useEffect(() => {
        setValue(defaultValue);
    }, [ defaultValue ]);

    const inputChanged = (date: Date | null, e : any) => {
        setValue(date);
        if (valueSubmitted)
            valueSubmitted(date /*Moment(date).add(3, 'hours').toDate()*/);
    };

    return <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && !value })}>
        {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
        <div className={styles.value}>
            {isReadOnly ? (<>{(value ? <div dangerouslySetInnerHTML={{__html: value.toLocaleDateString('ru-RU')}}></div> : '—')}</>) : (
                <DatePicker 
                locale={ru} 
                className={styles.input} selected={value ? Moment(value).add(3, 'hours').toDate() : value} onChange={inputChanged} dateFormat='dd.MM.yyyy HH:mm' showTimeSelect showTimeCaption={false} />
            )}
        </div>
    </div>
}