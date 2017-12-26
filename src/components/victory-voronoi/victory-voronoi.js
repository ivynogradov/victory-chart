import CustomPropTypes from 'prop-types';
import React from "react";
import { partialRight } from "lodash";
import { Helpers, VictoryLabel, addEvents, VictoryContainer, VictoryTheme, DefaultTransitions, Voronoi, Data, Domain } from "victory-core";
import VoronoiHelpers from "./helper-methods";
import { BaseProps, DataProps } from "../../helpers/common-props";

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

const animationWhitelist = [
  "data", "domain", "height", "padding", "samples", "size", "style", "width"
];

class VictoryVoronoi extends React.Component {
  static defaultProps = {
    containerComponent: <VictoryContainer/>,
    dataComponent: <Voronoi/>,
    labelComponent: <VictoryLabel/>,
    groupComponent: <g role="presentation"/>,
    samples: 50,
    scale: "linear",
    sortOrder: "ascending",
    standalone: true,
    theme: VictoryTheme.grayscale
  };
  static defaultTransitions = DefaultTransitions.discreteTransitions();
  static displayName = "VictoryVoronoi";

  static expectedComponents = [
    "dataComponent", "labelComponent", "groupComponent", "containerComponent"
  ];

  static getBaseProps = partialRight(
    VoronoiHelpers.getBaseProps.bind(VoronoiHelpers), fallbackProps);

  static getData = Data.getData.bind(Data);
  static getDomain = Domain.getDomain.bind(Domain);
  static propTypes = {
    ...BaseProps,
    ...DataProps,
    size: CustomPropTypes.nonNegative
  };
  static role = "voronoi";

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
    const children = this.renderData(props);
    return props.standalone ? this.renderContainer(props.containerComponent, children) : children;
  }
}

export default addEvents(VictoryVoronoi);