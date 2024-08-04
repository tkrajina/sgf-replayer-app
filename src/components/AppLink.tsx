import { Fragment, h } from 'preact';
import { Game } from '../models';
import { Link } from 'preact-router';
import { route } from 'preact-router';
import { APPLICATION_SERVICE  } from '../services/ApplicationService';

export function AppLink(props: {activeClassName?: string} & preact.JSX.HTMLAttributes) {
  const href = props.href;
  if (href.toString().toLowerCase().startsWith("http")) {
    return <Link {...props}>{props.children}</Link>;
  }

  const onClick = async () => {
		console.log("onchange => sync");
		try {
			await APPLICATION_SERVICE.sync();
		} catch (e) {
			console.error("Sync failed", e);
		}
    route(href.toString());
  }

  props.href = undefined;
  return <Link onClick={onClick} {...props}>{props.children}</Link>;
}