import React, {
    FC, useState, KeyboardEvent, useEffect,
} from 'react';
import classNames from 'classnames';
import styles from './SearchPill.module.scss';
import { getArtifactTypeDisplayName, getIndicatorTypeAutocompleteObjects, handleHttpError, i18n } from '../../utils';
import { Button } from '../Button';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { Input } from '../Input';
import { searchArtifacts } from '../../services/pages/artifacts';
import { ExtSearchDlg } from '../ExtSearchDlg';
import { Loader } from '../Loader';
import { searchProductTypes } from '../../services/pages/products';


  type SearchPillProps = {
    artifactType: string;
    onDeleteClick: () => void;
    onArtifactSelected: (artifact: any) => void;
    selectedArtifact?: any;
    onArtifactAttribSelected: (attr: any, valId: string, valName: string) => void;
    selectedArtifactAttrib?: any;
  }

  const getProductTypeOptions = async (search: string) => searchProductTypes({ filters: [], filters_for_join: [], global_query: search, limit: 99999, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ id: item.id, name: item.name })));

  export const SearchPill: FC<SearchPillProps> = ({ artifactType, onDeleteClick, onArtifactSelected, selectedArtifact, onArtifactAttribSelected, selectedArtifactAttrib }) => {
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownItems, setDropdownItems] = useState<any[]>([]);
    const [showExtSearch, setShowExtSearch] = useState(false);

    const [artifactSearchAttribs, setArtifactSearchAttribs] = useState<any>({
        indicator: {
            indicator_type_id: {
                artifactType: 'indicator',
                name: 'indicator_type_id',
                displayName: i18n('Тип показателя'),
                getValues: getIndicatorTypeAutocompleteObjects,
                values: undefined
            }
        },
        product: {
            product_type_ids: {
                artifactType: 'product',
                name: 'product_type_ids',
                displayName: i18n('Тип продукта'),
                getValues: getProductTypeOptions,
                values: undefined
            }
        }
    });

    const loadAttribVals = (artifactType: string, attrName: string) => {
        artifactSearchAttribs[artifactType][attrName].getValues('').then((res:any) => {
            setArtifactSearchAttribs((prev:any) => ({...prev, [artifactType]: {...prev[artifactType], [attrName]: {...prev[artifactType][attrName], values: res }}}));
        });
    }

    useEffect(() => {
        document.addEventListener('click', (e) => { if (!(e.target as any).closest('.search_pill')) setShowDropdown(false);  });
    }, []);

    useEffect(() => {
        if (showDropdown) {
            searchArtifacts({ filters: [{ column: 'artifact_type', value: artifactType, operator: 'EQUAL' }, { column: 'name', value: search, operator: 'LIKE' }], filters_for_join: [], global_query: '', offset: 0, limit: 10, sort: 'name+', state: 'PUBLISHED' }).then(resp => {
                setDropdownItems(resp.items);
            }).catch(handleHttpError);
        }
    }, [ showDropdown, search, artifactType ]);

    return <div className={classNames(styles.pill, 'search_pill')}>
        <Button className={classNames(styles.btn_name, 'btn_search_pill')} background='none' onClick={() => setShowDropdown(!showDropdown)} 
            title={selectedArtifact ? (getArtifactTypeDisplayName(artifactType, false) + ': ' + selectedArtifact.name) : (selectedArtifactAttrib ? (selectedArtifactAttrib.attr.displayName + ': ' + selectedArtifactAttrib.valName) : getArtifactTypeDisplayName(artifactType, true)) }>
            {selectedArtifact && (<><span>{getArtifactTypeDisplayName(artifactType, false)}:</span><span className={styles.artifact_name}>{selectedArtifact.name}</span></>)}
            {selectedArtifactAttrib && (<><span>{selectedArtifactAttrib.attr.displayName}:</span><span className={styles.artifact_name}>{selectedArtifactAttrib.valName}</span></>)}
            {!selectedArtifact && !selectedArtifactAttrib && (getArtifactTypeDisplayName(artifactType, true))}
        </Button>
        <Button className={styles.btn_del} background='none' onClick={onDeleteClick}><CloseIcon /></Button>
        {showDropdown && (<div className={styles.dropdown}>
            <Input className={styles.inp_search} placeholder={i18n('Поиск')} value={search} onChange={(e) => setSearch(e.target.value)} enterKeyBlursInput />
            <div onClick={() => { setShowExtSearch(true); setShowDropdown(false); }} className={classNames(styles.item, styles.item_ext_srch)}>{i18n('Расширенный поиск')}</div>
            
            {artifactSearchAttribs[artifactType] && (
                <>
                    {Object.keys(artifactSearchAttribs[artifactType]).map((an:string) => 
                        <div key={'dd-attr-' + an} className={classNames(styles.item, styles.has_children)} onMouseEnter={() => loadAttribVals(artifactType, an)}>
                            {artifactSearchAttribs[artifactType][an].displayName}
                            <div className={styles.dd_submenu}>
                                {typeof artifactSearchAttribs[artifactType][an].values != 'undefined' ? (
                                    <>
                                    {artifactSearchAttribs[artifactType][an].values.map((v:any) => <div key={'dd-av-' + v.id} className={styles.item} onClick={() => { setShowDropdown(false); onArtifactAttribSelected(artifactSearchAttribs[artifactType][an], v.id, v.name) }}>{v.name}</div>)}
                                    </>
                                ) : (<Loader size={20} className='centrify' />)}
                            </div>
                        </div>)}
                </>
            )}
            {dropdownItems.map(item => <div key={'dd-i-' + item.id} onClick={() => {  setShowDropdown(false); onArtifactSelected(item); }} className={styles.item}>{item.name}</div>)}
        </div>)}
        <ExtSearchDlg cookieKey={'sp-ext-s-' + artifactType} show={showExtSearch} onClose={() => setShowExtSearch(false)} filter={[ { column: 'artifact_type', operator: 'EQUAL', value: artifactType } ]} 
            onSubmit={(row: any) => { setShowExtSearch(false); onArtifactSelected(row); }} 
        />
    </div>
  }
  