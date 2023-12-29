/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Node, Edge,
} from 'reactflow';

import CustomNode, { CustomNodeData } from './CustomNode';

import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount, uuid } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import styles from './QualityTasks.module.scss';
import 'reactflow/dist/style.css';
import { getQualityTasksAssertionByRunId, getQualityTasksByRunId } from '../../services/pages/qualityTasks';
import './CustomNode.module.css';

type ElementType = {
  entity: {
    input_system_name: string, input_system_id: string, output_system_name: string, output_system_id: string,
    system_producer: string, producer: string, output_asset_domain_name: string, input_asset_domain_name: string,
    output_asset_domain_id: string, input_asset_domain_id: string, input_asset_id: string, output_asset_id: string, state: string,
    run_id: string, parent_run_id: string, input_asset_name: any, input_id: any, output_asset_name: any, output_id: any,
    state_local: string, state_name_local: string,
  };
};
type DateiledElementType = {
  entity: {
    state_name: string, rule_name: string, column: string, msg: string, rule_id: string, ol_id: string, assertion: string,
  }
};

export function QualityTasks() {
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [showDiagramDetail, setShowDiagramDetail] = useState(false);
  const [runId, setRunId] = useState(null);
  const nodeTypes = {
    custom: CustomNode,
  };
  const [showDiagram, setShowDiagram] = useState(false);
  const renderDate = (row: any, dateField: string) => {
    if (row === undefined || row[dateField] === undefined) return '';
    return new Date(row[dateField]).toLocaleString('ru-RU');
  };
  const columns = [
    { property: 'id', header: 'ID', isHidden: true },

    {
      property: 'full_name',
      header: i18n('Название потока'),
    },
    {
      property: 'event_time',
      filter_property: 'event_time',
      header: i18n('Дата операции'),
      render: (row: any) => renderDate(row, 'event_time'),
    },
    {
      property: 'state_name',
      filter_property: 'state_name',
      header: i18n('Статус выполнения'),
    },
    {
      property: 'assertion_msg',
      header: i18n('Комментарий'),
    },
  ];

  const columns_detail = [

    {
      property: 'rule_name',
      header: i18n('Проверка'),
    },
    {
      property: 'column',
      header: i18n('Колонки'),
    },
    {
      property: 'msg',
      header: i18n('Комментарий'),
    },
    {
      property: 'state_name',
      header: i18n('Состояние'),
    },
  ];

  const rowStyle = (row: any) => {
    if (row.state === '0') {
      return styles.red_row_class;
    } if (row.state === '1') {
      return styles.yellow_row_class;
    }

    return styles.green_row_class;
  };

  const getNodeStyle = (state_id: string) => {
    if (state_id === '0') {
      return '#d7baba';
    } if (state_id === '1') {
      return '#d7d6ba';
    }
    return '#bad7bb';
  };

  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const createNode = (
    id: string,
    x: number,
    y: number,
    name: string,
    system_name: string,
    system_id: string,
    producer: string,
    domain_name: string,
    domain_id: string,
    asset_id: string,
    state_id: string,
    run_id: string,
  ) => {
    const c: string = getNodeStyle(state_id);
    return {
      id,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: c,
        color: 'white',
        width: 250,
        borderRadius: '10px',
        borderColor: 'black',
        borderStyle: 'groove',
      },
      position: { x, y },
      data: {
        run_id,
        producer,
        asset: { name, url: `/data_assets/edit/${asset_id}` },
        system: { name: system_name, url: `/systems/edit/${system_id}` },
        domain: { name: domain_name, url: `/domains/edit/${domain_id}` },

      },
      type: 'custom',
    };
  };
  const createEdge = (id: string, source: string, target: string) => ({
    id,
    source,
    target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      strokeWidth: 2,
    },
    type: 'smoothstep',
  });
  const getParentId = (src: ElementType[], parent_run_id: string) => {
    for (let i = 0; i < src.length; i++) {
      if (parent_run_id === src[i].entity.run_id && !src[i].entity.parent_run_id) { return src[i].entity.output_id; }
    }
  };

  useEffect(() => {
    if (runId) {
      getQualityTasksByRunId(runId).then((json) => {
        const initialNodes: Node<CustomNodeData>[] = [];
        const initialEdges: any[] = [];
        let x = -250;
        let y = 0;
        let prid = '';
        const shift = 300;
        json.forEach((e: ElementType) => {
          const element = e.entity;
          if (prid === element.parent_run_id) {
            y += shift / 2;
            x -= shift;
          }

          if (!element.parent_run_id) {
            if (element.input_id) {
              x += shift;
              initialNodes.push(createNode(
                element.input_id,
                x,
                y,
                element.input_asset_name,
                element.input_system_name,
                element.input_system_id,
                element.producer,
                element.input_asset_domain_name,
                element.input_asset_domain_id,
                element.input_asset_id,
                element.state_local,
                element.run_id,

              ));
            }
            if (element.output_id) {
              x += shift;
              initialNodes.push(createNode(
                element.output_id,
                x,
                y,
                element.output_asset_name,
                element.output_system_name,
                element.output_system_id,
                element.producer,
                element.output_asset_domain_name,
                element.output_asset_domain_id,
                element.output_asset_id,
                element.state_local,
                element.run_id,
              ));
            }
            if (element.output_id && element.input_id) {
              initialEdges.push(createEdge(`${element.output_id}-${element.input_id}`, element.input_id, element.output_id));
            }
          } else if ((element.input_id && element.output_id) || (!element.input_id && element.output_id)) {
            x += shift;
            initialNodes.push(createNode(
              element.output_id,
              x,
              y,
              element.output_asset_name,
              element.output_system_name,
              element.output_system_id,
              element.producer,
              element.output_asset_domain_name,
              element.output_asset_domain_id,
              element.output_asset_id,
              element.state_local,
              element.run_id,
            ));
            const parentId = getParentId(json, element.parent_run_id);
            initialEdges.push(createEdge(`${parentId}-${element.output_id}`, parentId!, element.output_id));
          } else if (element.input_id && !element.output_id) {
            x += shift;
            initialNodes.push(createNode(
              element.input_id,
              x,
              y,
              element.input_asset_name,
              element.input_system_name,
              element.input_system_id,
              element.producer,
              element.input_asset_domain_name,
              element.input_asset_domain_id,
              element.input_asset_id,
              element.state_local,
              element.run_id,
            ));
            const parentId = getParentId(json, element.parent_run_id);
            initialEdges.push(createEdge(`${parentId}-${element.input_id}`, parentId!, element.input_id));
          }
          prid = element.parent_run_id;
        });
        setEdges(initialEdges);
        setNodes(initialNodes);
      }).catch(handleHttpError);
    }
  }, [runId]);

  const nodeClick = (event: React.MouseEvent<Element, MouseEvent>, node: Node<CustomNodeData>) => {
    getQualityTasksAssertionByRunId(node.data.run_id).then((json) => {
      setDetailData(json);
      setShowDiagramDetail(true);
    }).catch(handleHttpError);
  };
  const handleClose = () => {
    setShowDiagramDetail(false);
    return false;
  };
  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Мониторинг качества')}`}</div>
  
          {showDiagram ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                onNodeDoubleClick={nodeClick}
              >

                <Controls />
                <Background color="#aaa" gap={16} />
              </ReactFlow>
            </div>
          ) : (<> </>)}
          {data !== undefined ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              dataUrl="/v1/quality_tasks/search"
              limitSteward={false}
              initialFetchRequest={{
                sort: '-event_time',
                global_query: state.q !== undefined ? state.q : '',
                limit: getTablePageSize(),
                offset: (state.p - 1) * getTablePageSize(),
                filters: [],
                filters_preset: [],
                filters_for_join: [],
              }}
              showCreateBtn={false}
              onRowClick={(row: any) => {
                setRunId(row.run_id);
                setShowDiagram(true);
              }}
              onPageChange={(page: number) => (
                setState(() => ({ p: page }))
              )}
              onQueryChange={(query: string) => (
                setState(() => ({ p: undefined, q: query }))
              )}
              rowClassName={rowStyle}
            />

          ) : (
            ''
          )}

        </>
      )}
      <Modal
        show={showDiagramDetail}
        backdrop={false}
        onHide={handleClose}
        dialogClassName={styles.modal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Вызываемые проверки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.table_wrap}>
            <table className={styles.table_data}>

              <thead>
                <tr>
                  {columns_detail.map((rec: any) => (
                    <th key={uuid()}>{rec.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {
                  detailData.map((row: DateiledElementType) => (
                    <tr key={uuid()} className={rowStyle(row.entity)}>
                      {columns_detail.map((rec: any) => (
                        <td>{row.entity[rec.property as keyof typeof row.entity]}</td>
                      ))}
                    </tr>
                  ))
                }

              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
