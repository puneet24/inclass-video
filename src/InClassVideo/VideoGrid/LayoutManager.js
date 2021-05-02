import React from "react";
import debounce from "lodash/debounce";

/**
 * Sole purpose is to provide width/height to child component
 */
class LayoutManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._debouncedUpdateDimensions = debounce(this.updateDimensions, 300);
  }

  componentDidMount() {
    window.addEventListener("resize", this._debouncedUpdateDimensions, false);
    this._debouncedUpdateDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener(
      "resize",
      this._debouncedUpdateDimensions,
      false
    );
  }

  updateDimensions = () => {
    if (!this.el) {
      return;
    }
    const box = this.el.parentElement.getBoundingClientRect();
    const parentElementDimensions = {
      width: box.width,
      height: box.height
    };
    this.setState(parentElementDimensions);
  };

  render() {
    const childProps = { ...this.state };
    const children = React.Children.map(this.props.children, child =>
      React.cloneElement(child, childProps)
    );
    return (
      <div className="ui-layout-manager" ref={node => (this.el = node)}>
        {children}
      </div>
    );
  }
}

export default LayoutManager;
