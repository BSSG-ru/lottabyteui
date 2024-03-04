import React from 'react';
import { i18n } from '../utils';
import styles from '../pages/LogicObjects/LogicObjects.module.scss';
import { renderDate } from '../components/Table';

const map = new Map([
  ['TEXT', 'Текстовый'],
  ['INTEGER', 'Целочисленный'],
  ['NUMERIC', 'С плавающей точкой'],
  ['BOOLEAN', 'Логический'],
  ['DATE', 'Дата'],
]);

export const renderAttr = (row: any, typeField: string) => {
  if (!row[typeField]) return '';
  return map.get(row[typeField]);
};

export const renderAttribute = (attrVal: string) => {
  if (!attrVal) return '';
  return map.get(attrVal);
};
export const attributesTableColumns = [
  { property: 'id', header: 'ID', isHidden: true },
  { property: 'attribute_id', header: 'Attr ID', isHidden: true },
  {
    property: 'num',
    header: i18n('Koд'),
    sortDisabled: true,
    filterDisabled: true,
  },
  {
    property: 'name',
    header: i18n('Название'),
    renderActionsPopup: (row: any) => (
      <div>
        <a
          href="#"
          className={styles.btn_create}
        />
        <a
          href={`/queries/${encodeURIComponent(row.id)}`}
          className={styles.btn_edit}
        />
        <a
          href="#"
          className={styles.btn_del}
        />
      </div>
    ),
  },
  {
    property: 'description',
    header: i18n('Описание'),
  },
  {
    property: 'attribute_type',
    header: i18n('Тип'),
    filter_property: 'attribute_type_name',
    render: (row: any) => renderAttr(row, 'attribute_type'),
  },
  {
    property: 'is_pk',
    header: i18n('ПК'),
    filterDisabled: true,
    render: (row: any) => (row.is_pk ? i18n('Да') : '')
  },
  {
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
  {
    property: 'tags',
    header: i18n('Теги'),
    filterDisabled: false,
    sortDisabled: true,
    render: (row: any) => row.tags.join(', '),
  }
];

export const entityTableColumns = [
  { property: 'id', header: 'ID', isHidden: true },
  {
    property: 'num',
    header: i18n('Koд'),
    sortDisabled: true,
    filterDisabled: true,
  },
  {
    property: 'name',
    header: i18n('Название')
  },
  {
    property: 'system',
    header: i18n('Системы'),
    sortDisabled: true,
    filterDisabled: false,
    filter_property: 'systems',
    render: (row: any) => {
      return row.systems ? row.systems.map((s:any) => { return s.name; }).join(', ') : '';
    },
  },
  {
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
  {
    property: 'tags',
    header: i18n('Теги'),
    filterDisabled: false,
    sortDisabled: true,
    render: (row: any) => row.tags.join(', '),
  }
];

export const samplesTableColumns = [
  { property: 'id', header: 'ID', isHidden: true },
  {
    property: 'num',
    header: i18n('Koд'),
    sortDisabled: true,
    filterDisabled: true,
  },
  {
    property: 'name',
    header: i18n('Название'),
    renderActionsPopup: (row: any) => (
      <div>
        <a
          href="#"
          className={styles.btn_create}
        />
        <a
          href={`/queries/${encodeURIComponent(row.id)}`}
          className={styles.btn_edit}
        />
        <a
          href="#"
          className={styles.btn_del}
        />
      </div>
    ),
  },
  {
    property: 'system_id',
    filter_property: 'system.name',
    header: i18n('Система'),
    render: (item: any) => <span>{item.system_name}</span>,
  },
  {
    property: 'description',
    header: i18n('Описание'),
  },
  {
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
];

export const assetsTableColumns = [
  { property: 'id', header: 'ID', isHidden: true },
  {
    property: 'num',
    header: i18n('Koд'),
    sortDisabled: true,
    filterDisabled: true,
  },
  {
    property: 'name',
    header: i18n('Название'),
  },
  {
    property: 'domain_id',
    filter_property: 'domain.name',
    header: i18n('Домен'),
    render: (item: any) => <span>{item.domain_name}</span>,
  },
  {
    property: 'system_id',
    filter_property: 'system.name',
    header: i18n('Система'),
    render: (item: any) => <span>{item.system_name}</span>,
  },
  {
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
  {
    property: 'tags',
    header: i18n('Теги'),
    filterDisabled: false,
    sortDisabled: true,
    render: (row: any) => row.tags.join(', '),
  }
];
