import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import { FC, ReactElement, ReactNode, useEffect, useState } from 'react';
import { getTablePageSize, i18n, uuid } from '../../utils';
import { ModalDlg } from '../ModalDlg';
import { renderDate, Table } from '../Table';
import { renderArtifactType } from '../Table/Table';
import styles from './ExtSearchDlg.module.scss';

export type ExtSearchDlgProps = {
    cookieKey: string;
    filter: any;
    show: boolean;
    onClose?: () => void;
    onSubmit: (row: any) => void;
    showArtifactType?: boolean;
}

export const ExtSearchDlg: FC<ExtSearchDlgProps> = ({ filter, show, onClose, onSubmit, cookieKey, showArtifactType }) => {
    const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
    const [selectedRow, setSelectedRow] = useState<any>(undefined);

    let columns = [
        { property: 'id', header: '', sortDisabled: true, filterDisabled: true, render: (row: any) => { return (row.selected) ? <div className={styles.radio_checked}><div className={styles.check}></div></div> : <div className={styles.radio}></div> } },
        { property: 'name', header: i18n('Название') },
        { property: 'created', header: i18n('Дата создания'), render: (row: any) => renderDate(row, 'created') },
        {
            property: 'tags',
            header: i18n('Теги'),
            filterDisabled: false,
            sortDisabled: true,
            render: (row: any) => <div className={styles.pills}>{row.tags.map((tag:any, i:number) => <span key={`tag-pill-${row.id}-${i}`} className={styles.pill}>#{tag}</span>)}</div>,
            width: '200px'
        }
    ];

    if (showArtifactType) {
        columns = [...columns.slice(0, 2), { property: 'artifact_type', header: i18n('Тип'), render: (row: any) => renderArtifactType(row, 'artifact_type') }, ...columns.slice(2)];
    }

    if (filter.some((f:any) => f.column == 'artifact_type' && (f.value == 'indicator' || f.value == 'product')))
        columns = [...columns.slice(0, 2), { property: 'type', header: i18n('Тип') }, ...columns.slice(2)];

    return <ModalDlg show={show} title={i18n('Расширенный поиск')} submitBtnText={i18n('Выбрать')} onClose={onClose} dialogClassName={styles.dlg} onSubmit={() => onSubmit(selectedRow)}>
        <Table
            cookieKey={cookieKey}
            pageSizeCookieSuffix='ext-s'
            className={styles.table}
            columns={columns}
            onRowClick={(row) => { setSelectedRow(row); }}
            paginate columnSearch globalSearch
            dataUrl={'/v1/artifacts/search?r=' + (selectedRow?.id ?? 0)}
            initialFetchRequest={{
                sort: 'name+',
                global_query: state.q !== undefined ? state.q : '',
                limit: getTablePageSize('ext-s'),
                offset: (state.p - 1) * getTablePageSize('ext-s'),
                filters: [],
                filters_preset: filter ?? [],
                filters_for_join: [],
            }}
            onPageChange={(page: number) => (
                setState(() => ({ p: page }))
            )}
            onQueryChange={(query: string) => (
                setState(() => ({ p: undefined, q: query }))
            )}
            processRows={async (rows) => {
                console.log('process');
                return rows.map(r => ({...r, selected: r.id == selectedRow?.id}));
            }}
        />
    </ModalDlg>
};