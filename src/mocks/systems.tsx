/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { i18n } from '../utils';
import styles from '../pages/Domains/Domains.module.scss';
import { renderDate } from '../components/Table';

export const systemsTableColumns = [
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
          href={`/systems/${encodeURIComponent(row.id)}`}
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
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
];

export const queriesTableColumns = [
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
    property: 'description',
    header: i18n('Описание'),
  },
  {
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
];

export const productsTableColumns = [
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
    property: 'product_type',
    filter_property: 'product_types',
    sortDisabled: true,
    header: i18n('Тип продукта'),
    render: (row: any) => {
      return row.product_types.map((s:any) => { return s.name; }).join(', ');
    },
  },
  {
    property: 'modified',
    header: i18n('Дата'),
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

export const entitiesTableColumns = [
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
    property: 'description',
    header: i18n('Описание'),
  },
  {
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
];


export const indicatorsTableColumns = [
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
    property: 'indicator_type_id',
    filter_property: 'indicator_type.name',
    header: i18n('Тип'),
    render: (item: any) => <span>{item.indicator_type_name}</span>,
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

export const beTableColumns = [
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
    property: 'tech_name',
    header: i18n('Техническое название'),
  },
  {
    property: 'alt_names',
    header: i18n('Альтернативные наименования'),
    render: (row: any) => <span>{row.alt_names ? row.alt_names.join(', ') : ''}</span>
  },
  {
    property: 'synonym',
    filter_property: 'synonyms',
    sortDisabled: true,
    header: i18n('Синонимы'),
    render: (row: any) => {
      return row.synonyms.map((s:any) => { return s.name; }).join(', ');
    },
  },
  {
    property: 'indicator_type_id',
    filter_property: 'indicator_type.name',
    header: i18n('Тип'),
    render: (item: any) => <span>{item.indicator_type_name}</span>,
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

export const prodTableColumns = [
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
    property: 'product_type',
    filter_property: 'product_types',
    sortDisabled: true,
    header: i18n('Тип продукта'),
    render: (row: any) => {
      return row.product_types.map((s:any) => { return s.name; }).join(', ');
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
    property: 'modified',
    header: i18n('Дата создания'),
    render: (row: any) => renderDate(row, 'modified'),
  },
];
