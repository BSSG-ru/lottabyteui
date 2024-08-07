/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
    FC, useCallback, useEffect, useMemo, useRef, useState,
  } from 'react';
import styles from './FieldVisualEditor.module.scss';
import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg';
import Button from 'react-bootstrap/Button';
import { i18n, setDataModified, uuid } from '../../utils';

import SunEditor from 'suneditor-react';
import SunEditorCore from "suneditor/src/lib/core";

import ru from 'suneditor/src/lang/ru'
import { Modal } from 'react-bootstrap';
import plugins from 'suneditor/src/plugins'
import { UploadBeforeHandler, UploadBeforeReturn, UploadInfo } from 'suneditor-react/dist/types/upload';
import { URL } from '../../services/requst_templates';
import classNames from 'classnames';
  
export type FieldVisualEditorProps = {
    className: string;
    isReadOnly?: boolean;
    isCreateMode?: boolean;
    isRequired?: boolean;
    showValidation?: boolean;
    labelPrefix: string;
    layout?: string;
    defaultValue: string | null;
    valueSubmitted: (value: string) => void;
    onBlur?: (value: string) => void;
};
  
export const FieldVisualEditor: FC<FieldVisualEditorProps> = ({
    className,
    isReadOnly,
    labelPrefix,
    defaultValue,
    layout,
    isRequired,
    showValidation,
    valueSubmitted,
  }) => {
    const [value, setValue] = useState<string>('');
    const [storedValue, setStoredValue] = useState<string>('');

    const [showEditorDlg, setShowEditorDlg] = useState<boolean>(false);
//    const [editor, setEditor] = useState<SunEditor | null>(null);
    const [inputId, setInputId] = useState<string>('input-fve-' + uuid());
    const editor = useRef<SunEditorCore>();

    const getSunEditorInstance = (sunEditor: SunEditorCore) => {
      editor.current = sunEditor;
    };
    
    useEffect(() => {
        if (showEditorDlg && !isReadOnly) {
  /*          setEditor(suneditor.create((document.getElementById(inputId) || inputId),{
                lang: ru,
                plugins: plugins,
                buttonList: [
                    ['undo', 'redo'],
                    ['font', 'fontSize', 'formatBlock'],
                    ['paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    ['fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    '/', // Line break
                    ['outdent', 'indent'],
                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                    ['table', 'link', 'image', 'video', 'audio' ], // You must add the 'katex' library at options to use the 'math' plugin.
                    ['fullScreen', 'showBlocks', 'codeView'],
                    ['preview', 'print'],
                    //['save', 'template'],
                ],
                imageUploadUrl: '/uploaddddargh',
                height: '800px'
            }));*/
        }
    }, [ showEditorDlg ]);
  
    useEffect(() => {
      setValue(defaultValue ?? '');
      setStoredValue(defaultValue ?? '');
    }, [defaultValue]);
  
    useEffect(() => {
      if (value != storedValue) {
        if (storedValue)
          setDataModified(true);
      }
    }, [ value, storedValue ]);
  
    const editClicked = () => {
      setShowEditorDlg(true);  
    };
  
    const handleEditorDlgClose = () => {
        setShowEditorDlg(false);
        return false;
    };

    const editorDlgSubmit = () => {
        setValue(editor.current?.getContents(true) ?? '');
        setStoredValue(editor.current?.getContents(true) ?? '');
        valueSubmitted(editor.current?.getContents(true) ?? '');
        setShowEditorDlg(false);
    };

    const editorImageUpload = (targetImgElement: HTMLImageElement, index: number, state: "create" | "update" | "delete", imageInfo: UploadInfo<HTMLImageElement>, remainingFilesCount: number) => {
      
      console.log('index', index);
      console.log('targetImgElement', targetImgElement);
      console.log('imageInfo', imageInfo);
      
      if (targetImgElement && targetImgElement.src.indexOf('http') !== 0)
        targetImgElement.src = `${URL}` + targetImgElement.src;
    };
  
    return (
      <div
        className={`${styles.field_vis_editor} ${className}${showValidation && isRequired && !storedValue ? ` ${styles.error}` : ''}`}
      >
        <div className={styles.row_value}>
          {layout === 'separated' ? (
            <>
              <label className={styles.label}>{labelPrefix}</label>
              <div className={classNames(styles.editor_preview, styles.display_value, 'sun-editor-editable')} dangerouslySetInnerHTML={{ __html: storedValue }}></div>
              <a className={styles.btn_edit} onClick={editClicked}>{isReadOnly ? (<EyeIcon />) : (<PencilIcon />) }</a>
            </>
          ) : (
            <>
              <div className={styles.value}>
                <>
                <label className={styles.inline}>{labelPrefix}</label>
                <div className={classNames(styles.editor_preview, 'sun-editor-editable')} dangerouslySetInnerHTML={{ __html: storedValue }}></div>
                </>
              </div>
              <a className={styles.btn_edit} onClick={editClicked}>{isReadOnly ? (<EyeIcon />) : (<PencilIcon />) }</a>
            </>
          )}
        </div>
  
        <Modal show={showEditorDlg} backdrop={false} onHide={handleEditorDlgClose} dialogClassName={styles.editor_dlg}>
            <Modal.Header closeButton><Modal.Title>{labelPrefix}</Modal.Title></Modal.Header>
            <Modal.Body>
              {isReadOnly ? (
                <div className={styles.editor_view} dangerouslySetInnerHTML={{ __html: storedValue }}></div>
              ) : (
                <SunEditor defaultValue={storedValue} lang={ru} setAllPlugins height='800px' getSunEditorInstance={getSunEditorInstance} onImageUpload={editorImageUpload} setOptions={{
                  plugins: plugins,
                  buttonList: [
                    ['undo', 'redo'],
                    ['font', 'fontSize', 'formatBlock'],
                    ['paragraphStyle', 'blockquote'],
                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                    ['fontColor', 'hiliteColor', 'textStyle'],
                    ['removeFormat'],
                    '/', // Line break
                    ['outdent', 'indent'],
                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                    ['table', 'link', 'image', 'video', 'audio' /** ,'math' */], // You must add the 'katex' library at options to use the 'math' plugin.
                    /** ['imageGallery'] */ // You must add the "imageGalleryUrl".
                    ['fullScreen', 'showBlocks', 'codeView'],
                    ['preview', 'print'],
                    //['save', 'template'],
                    /** ['dir', 'dir_ltr', 'dir_rtl'] */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
                  ],
                  imageUploadUrl: `${URL}/v1/artifacts/upload_image`
                }}></SunEditor>
              )}
            </Modal.Body>
            {isReadOnly ? (
              <Modal.Footer>
                <Button variant="primary" onClick={handleEditorDlgClose}>Закрыть</Button>
              </Modal.Footer>
            ) : (
              <Modal.Footer>
                  <Button variant="primary" onClick={() => editorDlgSubmit()}>Сохранить</Button>
                  <Button variant="secondary" onClick={handleEditorDlgClose}>Отмена</Button>
              </Modal.Footer>
            )}
        </Modal>
      </div>
    );
  };
  