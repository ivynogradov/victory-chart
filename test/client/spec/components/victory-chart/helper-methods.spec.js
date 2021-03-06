/* global sinon */
/* eslint-disable no-unused-expressions,react/no-multi-comp */
import Helpers from "src/components/victory-chart/helper-methods";
import React from "react";
import { VictoryAxis, VictoryLine, VictoryBar } from "src/index";
import { Log, Data } from "victory-core";
import Wrapper from "src/helpers/wrapper";
import { assign } from "lodash";

describe("victory-chart/helpers-methods", () => {
  const getVictoryLine = (props) => <VictoryLine {...props} />;
  const getVictoryAxis = (props) => <VictoryAxis {...props} />;
  const getVictoryBar = (props) => <VictoryBar {...props} />;

  describe("getChildComponents", () => {
    const defaultAxes = {
      independent: getVictoryAxis({}),
      dependent: getVictoryAxis({ dependentAxis: true })
    };
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Log, "warn");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns a pair of default axes when no children are given", () => {
      const children = [];
      const result = Helpers.getChildComponents({ children }, defaultAxes);
      expect(result).to.have.length(2);
      expect(result).to.deep.include.members([defaultAxes.independent, defaultAxes.dependent]);
    });

    it("adds default axes when none of the children are axis components", () => {
      const line = getVictoryLine({});
      const children = [line];
      const result = Helpers.getChildComponents({ children }, defaultAxes);
      expect(result).to.have.length(3);
      expect(result).to.deep.include.members([
        defaultAxes.independent, defaultAxes.dependent
      ]);
    });

    it("does not add default axes if axis any axis components exist in children", () => {
      const axis = getVictoryAxis({});
      const children = [axis];
      const result = Helpers.getChildComponents({ children }, defaultAxes);
      expect(result).to.have.length(1);
      expect(result[0].props).to.eql(axis.props);
    });

    it("only ever returns one independent axis", () => {
      const children = [
        getVictoryAxis({ orientation: "top" }),
        getVictoryAxis({ orientation: "right" })
      ];
      const result = Helpers.getChildComponents({ children }, defaultAxes);
      expect(result).to.have.length(1);
      expect(result[0].props).to.eql(children[0].props);
    });
  });

  describe("getDataComponents", () => {
    const bar = getVictoryBar({});
    const line = getVictoryLine({});
    const axis = getVictoryAxis({});
    const childComponents = [bar, line, axis];

    it("returns data components but not axis components", () => {
      const componentResult = Helpers.getDataComponents(childComponents);
      expect(componentResult).to.have.members([bar, line]);
      expect(componentResult).not.to.have.members([axis]);
    });
  });

  describe("getDomain", () => {
    const victoryLine = getVictoryLine({ domain: [0, 3] });
    const xAxis = getVictoryAxis({ dependentAxis: false });
    const yAxis = getVictoryAxis({ dependentAxis: true });
    const childComponents = [victoryLine, xAxis, yAxis];
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Wrapper, "getDomain");
      sandbox.spy(victoryLine.type, "getDomain");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("calculates a domain from props", () => {
      const props = { domain: { x: [1, 2], y: [2, 3] } };
      const domainResultX = Helpers.getDomain(props, "x", childComponents);
      expect(Wrapper.getDomain).calledWith(props, "x", childComponents).and.returned([1, 2]);
      expect(victoryLine.type.getDomain).notCalled;
      expect(domainResultX).to.eql([1, 2]);
    });

    it("calculates a domain from child components", () => {
      const props = {};
      const polarProps = { polar: undefined, startAngle: undefined, endAngle: undefined };
      const domainResultX = Helpers.getDomain(props, "x", childComponents);
      expect(Wrapper.getDomain).calledWith(props, "x", childComponents);
      expect(victoryLine.type.getDomain).calledWith(assign({}, victoryLine.props, polarProps));
      expect(domainResultX).to.eql(victoryLine.props.domain);
    });
  });

  describe("createStringMap", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(Data, "getStringsFromAxes");
      sandbox.spy(Wrapper, "getStringsFromCategories");
      sandbox.spy(Wrapper, "getStringsFromData");
      sandbox.spy(Wrapper, "getStringsFromChildren");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("returns a stringMap from axis tickValues", () => {
      const props = {};
      const axisComponent = getVictoryAxis({ tickValues: ["a", "b", "c"] });
      const childComponents = [axisComponent];
      const stringResult = Helpers.createStringMap(props, "x", childComponents);
      expect(Wrapper.getStringsFromChildren).calledWith(props, "x", childComponents)
        .and.returned(["a", "b", "c"]);
      expect(Data.getStringsFromAxes).calledWith(axisComponent.props, "x")
        .and.returned(["a", "b", "c"]);
      expect(Wrapper.getStringsFromCategories).calledWith(childComponents, "x")
        .and.returned([]);
      expect(Wrapper.getStringsFromData).calledWith(childComponents, "x")
        .and.returned([]);
      expect(stringResult).to.eql({ a: 1, b: 2, c: 3 });
    });

    it("returns a stringMap from axis tickValues, and string data", () => {
      const props = {};
      const axisComponent = getVictoryAxis({ tickValues: ["c", "d"] });
      const lineComponent = getVictoryLine({ data: [{ x: "a", y: 1 }, { x: "b", y: 1 }] });
      const childComponents = [axisComponent, lineComponent];
      const stringResult = Helpers.createStringMap(props, "x", childComponents);
      expect(Wrapper.getStringsFromChildren).calledWith(props, "x", childComponents)
        .and.returned(["a", "b", "c", "d"]);
      expect(Data.getStringsFromAxes).calledWith(axisComponent.props, "x")
        .and.returned(["c", "d"]);
      expect(Wrapper.getStringsFromCategories).calledWith(childComponents, "x")
        .and.returned([]);
      expect(Wrapper.getStringsFromData).calledWith(childComponents, "x")
        .and.returned(["a", "b"]);
      expect(stringResult).to.eql({ a: 1, b: 2, c: 3, d: 4 });
    });
  });
});
