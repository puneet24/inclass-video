import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
  loadingMessage: {
    display: "flex",
    width: "100%",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center"
  }
});

function Loader(props) {
  const { classes } = props;
  return (
    <div className={classes.loadingMessage} style={props.style}>
      <CircularProgress
        className={classes.progress}
        disableShrink
        color="secondary"
      />
    </div>
  );
}

export default withStyles(styles)(Loader);
