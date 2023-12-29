/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, {
  FC, useEffect, useRef, RefObject,
} from 'react';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';

import styles from './Tag.module.scss';

export type TagProps = {
  moreTag?: boolean;
  value: string;
  valueId?: string;
  wrapperRef?: RefObject<HTMLDivElement>;
  hideMode?: boolean;
  disableDelete?: boolean;
  onClick?: () => void;
  onDelete?: (tagName: string) => void;
  onDeleteId?: (tagId: string) => void;
};

export const Tag: FC<TagProps> = ({
  value,
  valueId,
  wrapperRef,
  hideMode,
  moreTag,
  disableDelete,
  onClick = () => {},
  onDelete = () => {},
  onDeleteId = () => {},
}) => {
  const tagRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (tagRef.current && wrapperRef && wrapperRef.current) {
      const tagParams = tagRef.current.getClientRects()[0];
      const wrapperParams = wrapperRef.current.getClientRects()[0];

      // 60 пикселей выделены под тег more
      // рассчитан на +999, не думаю, что будет когда-то тегов больше
      if (
        (tagParams && (tagParams.y !== wrapperParams.y
          || tagParams.x + tagParams.width + 60 > wrapperParams.x + wrapperParams.width))
        && hideMode
      ) {
        tagRef.current.style.display = 'none';
      }
    }
  }, [wrapperRef, hideMode]);

  return (
    <span
      className={classNames(styles.tag, { [styles.tag_more]: moreTag })}
      ref={tagRef}
      onClick={onClick}
      
    >
      <span dangerouslySetInnerHTML={{ __html: value }}></span>
      {disableDelete ? (
        ''
      ) : (
        <CloseIcon
          onClick={(e:MouseEvent) => {
            onDelete(value.replace('#', ''));
            if (valueId) onDeleteId(valueId);
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
    </span>
  );
};
