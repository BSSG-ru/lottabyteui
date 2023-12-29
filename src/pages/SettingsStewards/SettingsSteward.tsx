/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './SettingsSteward.module.scss';
import { handleHttpError, i18n } from '../../utils';
import { FieldEditor } from '../../components/FieldEditor';
import { createSteward, getSteward, updateSteward } from '../../services/pages/stewards';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getDomains } from '../../services/pages/domains';
import { getUser, getUsers } from '../../services/pages/users';
import { FieldMultipleCheckboxEditor } from '../../components/FieldMultipleCheckboxEditor';

export const SettingsSteward = () => {
  const [, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    entity: {
      name: null,
      description: null,
      domains: null,
      user_id: null,
    },
  });
  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [stewardId, setStewardId] = useState<string>('');

  const { id } = useParams();

  useEffect(() => {
    if (!stewardId && id) setStewardId(id);
  }, [id]);

  useEffect(() => {
    setCreateMode(stewardId === '');

    if (stewardId) {
      getSteward(stewardId)
        .then((json) => {
          setData(json);
          if (document.getElementById(`crumb_${stewardId}`) !== null) {
            document.getElementById(`crumb_${stewardId}`)!.innerText = json.entity.name;
          }
          setLoading(false);
        })
        .catch(handleHttpError);
    }
  }, [stewardId]);

  useEffect(() => {
    if (isCreateMode) {
      if (
        data.entity.name
        && data.entity.user_id
        && data.entity.domains
      ) {
        createSteward({
          name: data.entity.name,
          user_id: data.entity.user_id,
          domains: data.entity.domains,
        })
          .then((json) => {
            if (json.metadata.id) {
              setStewardId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/settings/stewards/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateStewardField = (field: string, value: string | string[]) => {
    if (stewardId) {
      const d: any = {};
      d[field] = value;
      updateSteward(stewardId, d)
        .then(() => { })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);

      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    }
  };

  const getDomainObjects = async (search: string) => getDomains({
    sort: 'name+',
    global_query: search,
    limit: 10000,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  const getUserDisplayValue = async (identity: string) => {
    if (!identity) return '';
    return getUser(identity)
      .then((json) => {
        if (json) return json.username;
        return undefined;
      })
      .catch((e) => {
        handleHttpError(e);
        return '';
      });
  };

  const getUserObjects = async (search: string) => getUsers({
    sort: 'username+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => {
    const res = [];
    for (let i = 0; i < json.items.length; i += 1) {
      res.push({ id: json.items[i].id, name: json.items[i].username, description: json.items[i].display_name });
    }
    return res;
  });

  return (
    <div className={`${styles.page} ${styles.queryPage}`}>
      <div className={styles.mainContent}>
        <div className={styles.general_data}>
          <div className={styles.data_row}>
            <FieldEditor
              isReadOnly={false}
              layout="separated"
              labelPrefix={`${i18n('ФИО')} `}
              defaultValue={data.entity.name}
              className=""
              isMultiline={false}
              valueSubmitted={(val) => {
                updateStewardField('name', val.toString());
              }}
              onBlur={(val) => {
                updateStewardField('name', val);
              }}
            />
          </div>
          {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={false}
                layout="separated"
                labelPrefix={`${i18n('Описание ')} `}
                defaultValue={data.entity.description}
                className=""
                valueSubmitted={(val) => {
                  updateStewardField('description', val.toString());
                }}
                onBlur={(val) => {
                  updateStewardField('description', val);
                }}
              />
            </div>
          )}
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              label={i18n('Пользователь')}
              defaultValue={data.entity.user_id}
              valueSubmitted={(identity) => updateStewardField('user_id', identity)}
              getDisplayValue={getUserDisplayValue}
              getObjects={getUserObjects}
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
            <FieldMultipleCheckboxEditor
              className=""
              isScroll
              label={i18n('Домены')}
              defaultValues={data.entity.domains}
              valueSubmitted={(ids) => updateStewardField('domains', ids)}
              dataSet={getDomainObjects}
              isRequired
              showValidation={showValidation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
