import classnames from 'classnames';
import {
  ComponentPropsWithoutRef,
  ReactElement,
  useEffect,
  useState,
} from 'react';

import './tabs.scss';

interface ITabData {
  title: string;
  component: ReactElement;
}

interface TabsProps {
  className?: string;
  tabData: ITabData[];
  value?: number;
  onChange?: () => void;
}

// props에 as 안썼을때 기본으로 사용될 태그
const DEFAULT_TAG = 'div';

/**
 * Tabs Component
 * @param tabData : { title : '', component: <></> } 탭 타이틀 및 바디 component 형태 데이터
 * @param value : 활성화 시킬 탭 인덱스 (값이 없을 시 초기값은 0)
 */
function Tabs({
  className,
  tabData,
  value = 0,
  onChange,
  children,
  ...tabsProps
}: TabsProps &
  Omit<ComponentPropsWithoutRef<typeof DEFAULT_TAG>, keyof TabsProps>) {
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
  const changeTabIndex = (index: number) => {
    setTabIndex(index);
  };

  // indicator inline style
  const tabIndicatorStyle = {
    width: `calc( 100% / ${tabData.length} )`,
    left: `calc( (100% / ${tabData.length}) * ${tabIndex} )`,
  };

  // 탭 Body 컴포넌트
  function TabBody() {
    return (
      <div className="tabs__body">
        {tabData.map((tab: ITabData, index) => {
          return (
            tabIndex === index && (
              <div className="tabs__body-item" key={index}>
                {tab.component}
              </div>
            )
          );
        })}
      </div>
    );
  }

  return (
    <div className={tabsClassName} {...tabsProps}>
      {/* function component로 빼면 indicator에 transition이 안먹힘... */}
      <div className="tabs__header">
        {tabData.map((tab: ITabData, index) => {
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
        <div className="tabs__header-indicator" style={tabIndicatorStyle}></div>
      </div>

      <TabBody />
      {children}
    </div>
  );
}

Tabs.displayName = 'Tabs';

export default Tabs;
