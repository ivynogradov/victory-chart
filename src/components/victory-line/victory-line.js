import { partialRight } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import LineHelpers from "./helper-methods";
import { Helpers, VictoryLabel, addEvents, VictoryContainer, VictoryTheme, DefaultTransitions, Curve, VictoryClipContainer, Data, Domain } from "victory-core";
import { BaseProps, DataProps } from "../../helpers/common-props";

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50,
  interpolation: "linear"
};

const options = {
  components: [
    { name: "parent", index: "parent" }, { name: "data", index: "all" }, { name: "labels" }
  ]
};

const animationWhitelist = ["data", "domain", "height", "padding", "samples", "style", "width"];

class VictoryLine extends React.Component {
  static continuous = true;
  static defaultPolarTransitions = DefaultTransitions.continuousPolarTransitions();
  static defaultProps = {
    containerComponent: <VictoryContainer/>,
    dataComponent: <Curve/>,
    labelComponent: <VictoryLabel renderInPortal/>,
    groupComponent: <VictoryClipContainer/>,
    samples: 50,
    scale: "linear",
    sortKey: "x",
    sortOrder: "ascending",
    standalone: true,
    theme: VictoryTheme.grayscale
  };
  static defaultTransitions = DefaultTransitions.continuousTransitions();
  static displayName = "VictoryLine";

  static expectedComponents = [
    "dataComponent", "labelComponent", "groupComponent", "containerComponent"
  ];

  static getBaseProps = partialRight(LineHelpers.getBaseProps.bind(LineHelpers),
    fallbackProps);

  static getData = Data.getData.bind(Data);
  static getDomain = Domain.getDomain.bind(Domain);
  static propTypes = {
    ...BaseProps,
    ...DataProps,
    interpolation: PropTypes.oneOf([
      "basis", "bundle", "cardinal", "catmullRom", "linear", "monotoneX",
      "monotoneY", "natural", "step", "stepAfter", "stepBefore"
    ]),
    label: CustomPropTypes.deprecated(
      PropTypes.string,
      "Use `labels` instead for individual data labels"
    )
  };
  static role = "line";

  // Overridden in native versions
  shouldAnimate() {
    return !!this.props.animate;
  }

  render() {
    const { role } = this.constructor;
    const props = Helpers.modifyProps(this.props, fallbackProps, role);
    if (this.shouldAnimate()) {
      return this.animateComponent(props, animationWhitelist);
    }
    const children = this.renderContinuousData(props);
    return props.standalone ? this.renderContainer(props.containerComponent, children) : children;
  }
}
export default addEvents(VictoryLine, options);
