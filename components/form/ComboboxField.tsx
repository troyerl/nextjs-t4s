// import { useEffect, useState } from "react";
// import ErrorMessage from "./ErrorMessage";
// import _ from "lodash";

// export interface ComboboxOptions {
//   label: string;
//   value: string;
// }

// interface ComboboxProps {
//   options: ComboboxOptions[];
//   value: string;
//   class?: string;
//   outline?: boolean;
//   disabled?: boolean;
//   label: string;
//   id: string;
//   inputProps?: any;
//   onChange?: (e: any) => void;
// }

// export const ComboboxField = ({
//   value,
//   class: className,
//   id,
//   label,
//   inputProps,
//   options,
//   onChange,
// }: ComboboxProps) => {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [displayOptions, setDisplayOptions] = useState(options);
//   const [optionsStore] = useState(options);
//   const [selectedOption, setSelectedOption] = useState(
//     options.find((option) => option.value === value) ?? null,
//   );

//   useEffect(() => {
//     if (!selectedOption) {
//       return;
//     }

//     onChange?.(selectedOption);
//   }, [selectedOption, onChange]);

//   return (
//     <div className="relative block">
//       <input
//         id={id}
//         placeholder=" "
//         type="text"
//         value={selectedOption?.label}
//         onFocus={() => setShowDropdown(true)}
//         onBlur={(e: any) => {
//           setShowDropdown(false);
//           setDisplayOptions(optionsStore);

//           setTimeout(() => {
//             const selectedOption = _.find(
//               optionsStore,
//               (option: ComboboxOptions) =>
//                 option.label === value || option.value === value,
//             );
//             e.target.value = selectedOption ? selectedOption.label : "";
//           }, 200);
//         }}
//         onKeyDown={(e: any) => {
//           const filteredOptions = _.filter(
//             optionsStore,
//             (option: ComboboxOptions) =>
//               _.includes(
//                 _.toLower(JSON.stringify(option.label)),
//                 _.toLower(e.target.value),
//               ),
//           );
//           setDisplayOptions(filteredOptions);
//         }}
//         class={`peer focus:border-primary w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none ${selectedOption ? "pr-18" : ""} hover:border-gray-400 ${className}`}
//         {...inputProps}
//       />
//       <label
//         htmlFor={id}
//         className={`peer-focus:text-primary absolute ${selectedOption ? "top-0 left-3 text-xs" : "top-1/2 left-4 text-base"} -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:left-3 peer-focus:-translate-y-1/2 peer-focus:bg-white peer-focus:text-xs`}
//       >
//         {label}
//       </label>
//       <button
//         type="button"
//         className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2"
//       >
//         <svg
//           viewBox="0 0 20 20"
//           fill="currentColor"
//           data-slot="icon"
//           aria-hidden="true"
//           className="size-5 text-gray-400"
//         >
//           <path
//             d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
//             clip-rule="evenodd"
//             fill-rule="evenodd"
//           />
//         </svg>
//       </button>

//       {showDropdown && (
//         <div className="absolute z-100 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline outline-black/5 sm:text-sm">
//           {_.map(
//             displayOptions,
//             ({ label, value: optionValue }: ComboboxOptions) => (
//               <li
//                 key={optionValue}
//                 data-value={optionValue}
//                 onMouseDown={() => {
//                   setSelectedOption({ label, value: optionValue });
//                 }}
//                 className={`block cursor-pointer truncate px-3 py-2 text-gray-900 hover:bg-gray-100 ${
//                   selectedOption === optionValue ? "bg-gray-200" : ""
//                 }`}
//               >
//                 {label}
//               </li>
//             ),
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// interface FormComboboxFieldProps extends ComboboxProps {
//   error: string;
// }

// export const FormComboboxField = ({
//   error,
//   ...inputProps
// }: FormComboboxFieldProps) => {
//   return (
//     <>
//       <ComboboxField
//         {...inputProps}
//         class={error ? "border-red-600" : undefined}
//       />
//       {error && <ErrorMessage error={error} class="mt-2" />}
//     </>
//   );
// };
