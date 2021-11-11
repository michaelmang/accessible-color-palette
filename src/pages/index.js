import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { median, std } from 'mathjs';
import React from 'react';
import defaultValues from 'tailwindcss/colors';
import { hex } from 'wcag-contrast';

import Editor from '../components/editor';

extend([a11yPlugin]);

const defaultRange = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
];
const defaultBaseColors = [
  'gray',
  'blue',
  'green',
  'yellow',
  'pink',
  'red',
  'purple',
  'indigo',
];
const defaultColors = Object.fromEntries(
  defaultBaseColors.flatMap(color =>
    defaultRange.map(size => [`${color}-${size}`, defaultValues[color][size]])
  )
);
const defaultMinimumContrastRation = 4.5;
const defaultMinimumLuminanceDeviation = 0.1;

const gusts = {
  invalid: 'ring ring-red-600 ring-offset-2 z-10',
  square: 'flex items-center justify-center h-12 w-full text-sm shadow-sm',
};

function capitalize(str) {
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function getBase(color) {
  // head
  return color.split('-')[0];
}

function getNumber(color) {
  // tail
  return color.split('-')[1];
}

function getMutableColor(baseColor, color, values) {
  return colord(values[`${baseColor}-${getNumber(color)}`]);
}

function wcagContrast(mutableColor) {
  return hex(
    mutableColor.toHex(),
    mutableColor.isLight() ? '#000' : '#fff'
  ).toFixed(1);
}

function wcagLuminance(mutableColor) {
  return mutableColor.luminance().toFixed(1);
}

function Color({
  color,
  colors: values,
  group = [],
  minimumContrastRation,
  minimumLuminanceDeviation,
  overlay,
}) {
  const mutableColor = getMutableColor(getBase(color), color, values);
  const getOverlay = overlay === 'contrast' ? wcagContrast : wcagLuminance;
  const luminances = group
    .map(color => getMutableColor(getBase(color), color, values))
    .map(getOverlay);
  const isInvalid =
    overlay === 'contrast'
      ? getOverlay(mutableColor) < minimumContrastRation
      : !luminances.length
      ? false
      : std(luminances) > minimumLuminanceDeviation &&
        getOverlay(mutableColor) !== median(luminances).toFixed(1);
  return (
    <div
      className={`${gusts.square} ${
        isInvalid ? gusts.invalid : ''
      } bg-${color} ${mutableColor.isLight() ? 'text-black' : 'text-white'}`}
    >
      {getOverlay(mutableColor)}
    </div>
  );
}

function Radio({ label, isChecked, onChange }) {
  function handleChange(e) {
    onChange(e.target.value);
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={label}
        name={label}
        onChange={handleChange}
        value={label}
        checked={isChecked}
      />
      <label className="mt-2" for={label}>
        {label}
      </label>
    </div>
  );
}

function Range({ range }) {
  return range.map(value => (
    <div key={value} className={gusts.square}>
      {value}
    </div>
  ));
}

export default function IndexPage() {
  const [code, setCode] = React.useState({
    range: defaultRange,
    baseColors: defaultBaseColors,
    colors: defaultColors,
    minimumContrastRation: defaultMinimumContrastRation,
    minimumLuminanceDeviation: defaultMinimumLuminanceDeviation,
  });
  const [overlay, setOverlay] = React.useState('contrast');

  return (
    <div className="flex flex-col w-screen min-h-screen bg-white">
      <header className="flex px-12 py-4 shadow-sm">
        <div className="font-bold">Accessible Color Palette</div>
      </header>
      {/* <div className="flex flex-col px-12 pt-4">
        <div className="flex mb-4 text-lg">Config</div>
        <Editor code={code} onChange={setCode} />
      </div> */}
      <main className="flex justify-between w-full h-full p-12 space-x-8">
        <div className="flex flex-col w-1/3">
          <div className="flex mb-4 text-lg">Palette</div>
          <div className={`grid grid-cols-${code.range.length + 1} gap-0`}>
            <div className={gusts.square} />
            <Range range={code.range} />
            {Object.keys(code.colors).map((color, index) => {
              return (
                <>
                  {index % code.range.length === 0 && (
                    <div className={gusts.square} style={{ fontSize: 12 }}>
                      {capitalize(getBase(color))}
                    </div>
                  )}
                  <Color
                    key={color}
                    color={color}
                    overlay={overlay}
                    {...code}
                  />
                </>
              );
            })}
          </div>
          <div className="flex flex-col mt-4">
            <div className="flex text-lg">Overlay</div>
            <div className="flex space-x-2">
              <Radio
                label="contrast"
                isChecked={overlay === 'contrast'}
                onChange={setOverlay}
              />
              <Radio
                label="luminance"
                isChecked={overlay === 'luminance'}
                onChange={setOverlay}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-1/3 space-y-8">
          {code.baseColors.map(baseColor => {
            return (
              <div key={baseColor} className="flex flex-col">
                <div className="flex mb-4 text-lg">{capitalize(baseColor)}</div>
                <div className="flex">
                  <Range range={code.range} />
                </div>
                <div className={`grid grid-cols-${code.range.length} gap-0`}>
                  {Object.keys(code.colors)
                    .filter(color => color.includes(baseColor))
                    .map(color => {
                      return (
                        <Color
                          key={color}
                          color={color}
                          overlay={overlay}
                          {...code}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col w-1/3 space-y-8">
          {code.range.flatMap(value => (
            <div className="flex flex-col">
              <div className="flex mb-4 text-lg">{value}</div>
              <div className={`grid grid-cols-${code.range.length} gap-0`}>
                {Object.keys(code.colors)
                  .filter(color => getNumber(color) === value)
                  .map((color, _, group) => {
                    return (
                      <Color
                        key={color}
                        color={color}
                        group={group}
                        overlay={overlay}
                        {...code}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
