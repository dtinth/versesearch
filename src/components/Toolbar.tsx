import classes from "./Toolbar.module.css";
export function Toolbar(props: { children: React.ReactNode }) {
  return <div className={classes.toolbar}>{props.children}</div>;
}
