import classNames from 'classnames';
import { FC, ReactElement, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';
import { Button } from '../Button';
import styles from './ModalDlg.module.scss';

export type ModalDlgProps = {
  show: boolean;
  title: string;
  submitBtnText?: string;
  onClose?: () => void;
  onSubmit?: () => void;
  showSubmitBtn?: boolean;
  cancelBtnText?: string;
  children?: React.ReactNode;
  showButtons?: boolean;
  dialogClassName?: string;
};

export const ModalDlg: FC<ModalDlgProps> = ({ show, onClose, title, onSubmit, submitBtnText = 'OK', children, showSubmitBtn = true, cancelBtnText = 'Отмена', showButtons = true, dialogClassName }) => (
  <Modal show={show} backdrop={true} onHide={onClose} dialogClassName={classNames(styles.modaldlg, [dialogClassName])}>
    <Modal.Header closeButton>
      <Modal.Title dangerouslySetInnerHTML={{ __html: title }}></Modal.Title>
    </Modal.Header>
    <Modal.Body>{children}</Modal.Body>
    {showButtons && (
    <Modal.Footer>
      <Button background='outlined-blue' onClick={onClose}>{cancelBtnText}</Button>
      {showSubmitBtn && (
        <Button background='blue' onClick={onSubmit}>{submitBtnText}</Button>
      )}
    </Modal.Footer>
    )}
  </Modal>
);
