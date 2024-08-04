import { Fragment, h } from 'preact';
import style from "./BaseScreen.css";
import useObservableListener from '../utils/useObservableListener';
import { gamesService } from '../services/GamesService';
import { deferredPrompt, install } from './app';
import { AppLink } from './AppLink';

type MenuID = "sgfs" | "new" | "rnd" | "stats" | "settings" | "info";

interface MenuOption {
  id: MenuID;
  icon: string;
  txt: string;
  url: string;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: "sgfs",
    icon: `/assets/svg/numbered-list-left.svg`,
    txt: "Games",
    url: "/",
  },
  {
    id: "new",
    icon: `/assets/svg/plus-circle.svg`,
    txt: "Add new",
    url: "/edit",
  },
  // {
  //   id: "stats",
  //   icon: `/assets/svg/stats-down-square.svg`,
  //   txt: "Stats",
  //   url: "/stats",
  // },
  {
    id: "settings",
    icon: `/assets/svg/settings.svg`,
    txt: "Settings",
    url: "/settings",
  },
  {
    id: "info",
    icon: `/assets/svg/info-circle.svg`,
    txt: "About",
    url: "/info",
  },
]

export function BaseScreen(props: { children: any, selected: MenuID, noPadding?: boolean }) {
	const deferredPromptObs = useObservableListener(deferredPrompt);
  return (
    <div className={style.mainContainer}>
      <div className={style.headerContainer}>
        <div className={style.headerLogo}>
          <AppLink href={"/"} style={{alignSelf: "center", justifySelf: "center"}}><img src={`/assets/logo.svg`} alt="Preact Logo" style={{width: "0.75cm"}} /></AppLink>
        </div>
        <div className={style.headerCenter}></div>
        {MENU_OPTIONS.map(o => <Fragment>
          <div className={`${style.headerMenu} ${o.id == props.selected ? style.headerMenuSelected : ""}`}>
            <AppLink href={o.url} style={{alignSelf: "center", textAlign: "center", fontSize: "0.9em"}}>
              <img src={o.icon} alt={o.txt} style={{filter: "invert(1) sepia(1) saturate(5) hue-rotate(175deg)", width: "0.4cm", height: "0.4cm"}} />
              <span className={style.hideOnSmallWindows}>
                <br/>
                {o.txt}
              </span>
            </AppLink>
          </div>
        </Fragment>)}
      </div>
      <div className={`${style.contentContainer} ${props.noPadding ? "" : style.contentContainerPadding}`}>
        {props.children}
      </div>
      {deferredPromptObs && 
        <div className={style.footerContainer}>
          <button onClick={install}>Install application</button>
          <small>
            &nbsp;
            and use it (even) offline.
          </small>
        </div>}
    </div>
  );
}

function BaseScreenContentDiv(props: {children: any, selected: MenuID, noPadding?: boolean}) {
  return <div className={style.contentContainerPadding}>
    {props.children}
  </div>
}