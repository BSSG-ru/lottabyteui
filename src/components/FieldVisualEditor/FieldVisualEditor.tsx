/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
    FC, useCallback, useEffect, useMemo, useRef, useState,
  } from 'react';
import styles from './FieldVisualEditor.module.scss';
import { i18n, setDataModified, uuid } from '../../utils';

import SunEditor from 'suneditor-react';
import SunEditorCore from "suneditor/src/lib/core";

import ru from 'suneditor/src/lang/ru'
import plugins from 'suneditor/src/plugins'
import { UploadInfo } from 'suneditor-react/dist/types/upload';
import { URL } from '../../services/requst_templates';
import classNames from 'classnames';
  
export type FieldVisualEditorProps = {
    className?: string;
    isReadOnly?: boolean;
    isCreateMode?: boolean;
    isRequired?: boolean;
    showValidation?: boolean;
    label?: string;
    defaultValue: string | null;
    valueSubmitted: (value: string) => void;
};
  
export const FieldVisualEditor: FC<FieldVisualEditorProps> = ({
    className = '',
    isReadOnly,
    label,
    defaultValue,
    isRequired,
    showValidation,
    valueSubmitted,
  }) => {
    const [value, setValue] = useState<string>('');
    const [editorKey, setEditorKey] = useState('no');

    const [showEditorDlg, setShowEditorDlg] = useState<boolean>(false);
    const editor = useRef<SunEditorCore>();

    const getSunEditorInstance = (sunEditor: SunEditorCore) => {
      editor.current = sunEditor;
    };
    
    useEffect(() => {
      setValue(defaultValue ?? '');
      if (editorKey == 'no')
        setEditorKey(uuid());
    }, [defaultValue]);

    useEffect(() => {
      
    }, [value])
  
    const editorImageUpload = (targetImgElement: HTMLImageElement, index: number, state: "create" | "update" | "delete", imageInfo: UploadInfo<HTMLImageElement>, remainingFilesCount: number) => {
      if (targetImgElement && targetImgElement.src.indexOf('http') !== 0)
        targetImgElement.src = `${URL}` + targetImgElement.src;
    };
  
    return (
      <div className={`${styles.field_vis_editor} ${className}${showValidation && isRequired && !value ? ` ${styles.error}` : ''}`}>
        {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
        <div className={styles.value}>
          {isReadOnly ? (
            <div className={classNames(styles.editor_preview, styles.display_value, 'sun-editor-editable')} dangerouslySetInnerHTML={{ __html: value ? value : '—' }}></div>
          ) : (
            <SunEditor key={editorKey} defaultValue={value} lang={ru} setAllPlugins height='800px' getSunEditorInstance={getSunEditorInstance} onImageUpload={editorImageUpload}
              onChange={(content) => {
                setValue(editor.current?.getContents(true) ?? '');
                valueSubmitted(editor.current?.getContents(true) ?? '');
                setDataModified(true);
              }} 
              setOptions={{
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
        </div>
      </div>
    );
  };
  