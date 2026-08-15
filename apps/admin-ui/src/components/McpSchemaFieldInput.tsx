import React from 'react';
import { McpPropertySchema } from '@ax-analytics/shared';

export interface McpSchemaFieldInputProps {
  readonly name: string;
  readonly schema: McpPropertySchema;
  readonly value: unknown;
  readonly isRequired: boolean;
  readonly onChange: (name: string, val: unknown) => void;
}

export function McpSchemaFieldInput({
  name,
  schema,
  value,
  isRequired,
  onChange
}: McpSchemaFieldInputProps): React.ReactElement {
  const isEnum = schema.enum && schema.enum.length > 0;
  const isBoolean = schema.type === 'boolean';
  const isNumber = schema.type === 'number' || schema.type === 'integer';

  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-[#090412] border border-purple-900/50 hover:border-purple-700/60 transition-colors font-sans">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-purple-100 flex items-center gap-1 font-mono">
          <span>{name}</span>
          {isRequired && <span className="text-rose-400 font-extrabold text-sm">*</span>}
          {schema.type && (
            <span className="text-[10px] text-purple-400 font-normal px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/40">
              {schema.type}
            </span>
          )}
        </label>
        {isRequired && <span className="text-[10px] text-rose-300 font-mono font-semibold">required</span>}
      </div>

      {/* Render Field Input based on Schema Type */}
      {isEnum ? (
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(name, e.target.value)}
          required={isRequired}
          className="w-full bg-[#07030d] border border-purple-800/60 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        >
          {schema.enum!.map((enumOpt) => (
            <option key={String(enumOpt)} value={String(enumOpt)}>
              {String(enumOpt)}
            </option>
          ))}
        </select>
      ) : isBoolean ? (
        <label className="flex items-center space-x-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(name, e.target.checked)}
            className="w-4 h-4 rounded bg-[#07030d] border-purple-800 text-fuchsia-500 focus:ring-fuchsia-400"
          />
          <span className="text-xs text-purple-200 font-mono">
            {Boolean(value) ? 'True (Enabled)' : 'False (Disabled)'}
          </span>
        </label>
      ) : isNumber ? (
        <input
          type="number"
          value={value === '' || value === undefined ? '' : Number(value)}
          min={schema.minimum}
          max={schema.maximum}
          required={isRequired}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(name, raw === '' ? '' : Number(raw));
          }}
          placeholder={`Enter number${schema.minimum !== undefined ? ` (min: ${schema.minimum})` : ''}...`}
          className="w-full bg-[#07030d] border border-purple-800/60 rounded-lg px-3 py-1.5 text-xs text-cyan-200 font-mono focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        />
      ) : (
        <input
          type="text"
          value={String(value ?? '')}
          required={isRequired}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={`Enter ${name}...`}
          className="w-full bg-[#07030d] border border-purple-800/60 rounded-lg px-3 py-1.5 text-xs text-fuchsia-200 font-mono focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
        />
      )}

      {/* Description rendered below input as hint text */}
      {schema.description && (
        <p className="text-[11px] text-purple-300/80 leading-tight pt-0.5">{schema.description}</p>
      )}
    </div>
  );
}
