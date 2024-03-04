import { FC, useEffect, useState } from 'react';

import styles from './Dashboard.module.scss';
import React from 'react';
import { IItemClickEventArgs, TreeMapComponent } from '@syncfusion/ej2-react-treemap';
import { getDashboard } from "../../services/pages/artifacts";
import { doNavigate, handleHttpError } from "../../utils";
import { useNavigate } from "react-router";




export type DashboardProps = {};
type DashboardEntity = {
    id: string;
    name: string;
    weight: number;
    artifactType: string;
};

export const Dashboard: FC<DashboardProps> = ({}) => {
    const [productData, setProductData] = useState<DashboardEntity[]>([]);
    const [indicatorData, setIndicatorData] = useState<DashboardEntity[]>([]);
    const [beData, setBEData] = useState<DashboardEntity[]>([]);
    const [domainData, setDomainData] = useState<DashboardEntity[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        
        getDashboard().then(json => {
            let products = json.filter((x:DashboardEntity) => x.artifactType == 'product');
            products.push({ id: '', name: 'показать все...', weight: 100, artifactType: 'product' });
            setProductData(products);

            let indicators = json.filter((x:DashboardEntity) => x.artifactType == 'indicator');
            indicators.push({ id: '', name: 'показать все...', weight: 100, artifactType: 'indicator' });
            setIndicatorData(indicators);

            let bes = json.filter((x:DashboardEntity) => x.artifactType == 'business_entity');
            bes.push({ id: '', name: 'показать все...', weight: 100, artifactType: 'business_entity' });
            setBEData(bes);

            let domains = json.filter((x:DashboardEntity) => x.artifactType == 'domain');
            domains.push({ id: '', name: 'показать все...', weight: 100, artifactType: 'domain' });
            setDomainData(domains);
        }).catch(handleHttpError);
        
    }, []);

    const itemClick = (e:IItemClickEventArgs) => {
        var url = '/';
        var item = e.item as any;
        switch (item.data.artifactType) {
            case 'product': url += 'products'; break;
            case 'domain': url += 'domains'; break;
            case 'indicator': url += 'indicators'; break;
            case 'business_entity': url += 'business-entities'; break;
        }
        if (item.data.id)
            url += '/edit/' + item.data.id;
        doNavigate(url, navigate);
    };

    return <div className={styles.dashboard}>
        <div className={styles.tree_products}>
            <div className={styles.title}>Продукты</div>
            <TreeMapComponent margin={{left: 0, right: 0, top: 0, bottom: 0}} height='800px' width="100%" dataSource={productData} weightValuePath='weight' leafItemSettings={{ fill: '#BCD8EE', labelPath: 'name', labelPosition: 'BottomLeft', gap: 2, labelStyle: { color: '#323E5E' } }} itemClick={itemClick}></TreeMapComponent>
        </div>
        <div className={styles.tree_indicators}>
            <div className={styles.title}>Показатели</div>
            <TreeMapComponent margin={{left: 0, right: 0, top: 0, bottom: 0}} height='800px' width="100%" dataSource={indicatorData} weightValuePath='weight' leafItemSettings={{ fill: '#C2D4EC', labelPath: 'name', labelPosition: 'BottomLeft', gap: 2, labelStyle: { color: '#323E5E' } }} itemClick={itemClick}></TreeMapComponent>
        </div>
        <div className={styles.tree_bes}>
            <div className={styles.title}>Бизнес-сущности</div>
            <TreeMapComponent margin={{left: 0, right: 0, top: 0, bottom: 0}} height='500px' width="100%" dataSource={beData} weightValuePath='weight' leafItemSettings={{ fill: '#ACBCEB', labelPath: 'name', labelPosition: 'BottomLeft', gap: 2, labelStyle: { color: '#323E5E' } }} itemClick={itemClick}></TreeMapComponent>
        </div>
        <div className={styles.tree_domains}>
            <div className={styles.title}>Домены</div>
            <TreeMapComponent margin={{left: 0, right: 0, top: 0, bottom: 0}} height='300px' width="100%" dataSource={domainData} weightValuePath='weight' leafItemSettings={{ fill: '#94A4EA', labelPath: 'name', labelPosition: 'BottomLeft', gap: 2, labelStyle: { color: '#323E5E' } }} itemClick={itemClick}></TreeMapComponent>
        </div>
    </div>;
};
