import { Fragment, h } from 'preact';
import { Game } from '../models';

export function GameDesc(props: {game: Game, event?: boolean, result?: boolean, date?: boolean}) {
  return <Fragment>
    ⚫ <strong>{props.game.black} {props.game.blackRank && <Fragment>({props.game.blackRank})</Fragment>}</strong>
    &nbsp;vs&nbsp;
    ⚪ <strong>{props.game.white} {props.game.whiteRank && <Fragment>({props.game.whiteRank})</Fragment>}</strong>
    {(props.event && props.game.event) && <small><br/>Event: <strong>{props.game.event}</strong></small>}
    {(props.result && props.game.result) && <small><br/>Result: <strong>{props.game.result}</strong></small>}
    {(props.date && props.game.date) && <small><br/>Date: <strong>{props.game.date}</strong></small>}
  </Fragment>
}