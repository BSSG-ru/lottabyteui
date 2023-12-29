/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import styles from './Notices.module.scss';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { uuid } from '../../utils';

type NoticeData = {
  id: string;
  type: string;
  message: string;
};

export class Notices extends React.Component<{}, { notices: NoticeData[] }> {
  constructor(props: any) {
    super(props);
    this.state = { notices: [] };
    (window as any).notices = this;
  }

  delNotice = (id: string) => {
    this.setState({
      notices: this.state.notices.filter((data: NoticeData) => data.id !== id),
    });
  };

  addNotice = (type: string, message: string) => {
    this.setState({
      notices: [{ id: uuid(), type: type, message: message }, ...this.state.notices],
    });
  };

  render() {
    return (
      <div className={styles.notices_list}>
        {this.state.notices.map((data: NoticeData) => (
          <div
            key={uuid()}
            className={`${styles.notice} ${styles[data.type]}`}
          >
            <span dangerouslySetInnerHTML={{__html: data.message }}></span>
            <CloseIcon
              onClick={() => {
                this.delNotice(data.id);
              }}
            />
          </div>
        ))}
      </div>
    );
  }
}
