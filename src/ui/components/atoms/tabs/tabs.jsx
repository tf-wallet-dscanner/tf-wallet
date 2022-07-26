import classnames from 'classnames';
import { useEffect, useState } from 'react';

import './tabs.scss';

/**
 * Tabs Component
 * @param className(string?): add class
 * @param tabData : { title : '', component: <></> } 탭 타이틀 및 바디 component 형태 데이터
 * @param value : 활성화 시킬 탭 인덱스 (값이 없을 시 초기값은 0)
 * @param onChange: 탭 전환이 완료된 후 실행할 함수
 */
function Tabs({
  className,
  tabData,
  value = 0,
  onChange,
  children,
  ...tabsProps
}) {
  const [tabIndex, setTabIndex] = useState(value);
  const tabsClassName = classnames('tabs', className);

  // transition 이벤트 끝나는 시점 체크
  useEffect(() => {
    const transition = document.querySelector('.tabs__header-indicator');
    transition?.addEventListener('transitionend', () => {
      // 탭 전환 완료되면 호출 (transition end 시점)
      if (onChange) onChange();
    });

    return () => {
      // unmount 시 event 해제
      transition?.removeEventListener('transitionend', () => {});
    };
  }, []);

  // 탭 인덱스 변경
  const changeTabIndex = (index) => {
    setTabIndex(index);
  };

  // indicator inline style
  const tabIndicatorStyle = {
    width: `calc( 100% / ${tabData.length} )`,
    left: `calc( (100% / ${tabData.length}) * ${tabIndex} )`,
  };

  return (
    <div className={tabsClassName} {...tabsProps}>
      {/* function component로 빼면 indicator에 transition이 안먹힘... */}
      <div className="tabs__header">
        {tabData.map((tab, index) => {
          return (
            <div
              className={classnames('tabs__header-item', {
                'tabs__header-item-active': tabIndex === index,
              })}
              key={index}
              onClick={() => changeTabIndex(index)}
            >
              {tab.title}
            </div>
          );
        })}
        <div className="tabs__header-indicator" style={tabIndicatorStyle} />
      </div>

      {/* 탭 Body 컴포넌트 */}
      <div className="tabs__body">
        {tabData.map((tab, index) => {
          return (
            tabIndex === index && (
              <div className="tabs__body-item" key={index}>
                {tab.component}
              </div>
            )
          );
        })}
      </div>
      {children}
    </div>
  );
}

Tabs.displayName = 'Tabs';

export default Tabs;
