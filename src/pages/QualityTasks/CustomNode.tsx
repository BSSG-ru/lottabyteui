import React, { memo, ReactNode } from 'react';
import classNames from 'classnames';
import { Handle, NodeProps, Position } from 'reactflow';
import { ReactComponent as Asset } from '../../assets/icons/assets-icon.svg';
import { ReactComponent as System } from '../../assets/icons/systems-icon.svg';
import { ReactComponent as Task } from '../../assets/icons/tasks-icon.svg';
import { ReactComponent as Domain } from '../../assets/icons/domains-icon.svg';

import './CustomNode.module.css';

export type CustomNodeData = {
    producer: string,
    run_id: string,
    asset: { name: string, url: string },
    domain: { name: string, url: string },
    system: { name: string, url: string },
    icon?: ReactNode;
    bgColor?: string;

};

export default memo(({ data }: NodeProps<CustomNodeData>) => (

    <div style={{
        padding: '16px 20px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexGrow: '1',

    }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
                fontSize: '16px',
                marginBottom: '2px',
                lineHeight: '1',
            }}
            >

                {data.producer}
            </div>
            <div
                style={{
                    fontSize: '16px',
                    marginBottom: '2px',
                    lineHeight: '1',

                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                }}
                onClick={() => window.open(data.domain.url, '_blank', 'noreferrer')}
            >

                <Domain />
                <span style={{
                    color: 'blue',
                    cursor: 'pointer',
                }}
                >
                    {' '}
                    {data.domain.name}
                </span>

            </div>
            <div
                style={{
                    fontSize: '16px',
                    marginBottom: '2px',
                    lineHeight: '1',

                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                }}
                onClick={() => window.open(data.system.url, '_blank', 'noreferrer')}
            >

                <System />
                <span style={{
                    color: 'blue',
                    cursor: 'pointer',
                }}
                >
                    {data.system.name}

                </span>

            </div>
            <div
                style={{
                    fontSize: '16px',
                    marginBottom: '2px',
                    lineHeight: '1',

                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                }}
                onClick={() => window.open(data.asset.url, '_blank', 'noreferrer')}
            >

                <Asset />
                <span style={{
                    color: 'blue',
                    cursor: 'pointer',
                }}
                >
                    {' '}
                    {data.asset.name}
                </span>

            </div>
        </div>
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
    </div>

));
