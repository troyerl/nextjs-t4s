// import React from "react";
// import { XMark } from "../icons";
// import ErrorMessage from "./ErrorMessage";

// interface InputFieldProps {
//   label: string;
//   value?: string;
//   onInput?: (value: string) => void;
//   type?: string;
//   clearable?: boolean;
//   id: string;
//   startIcon?: React.ReactNode;
//   endIcon?: React.ReactNode;
//   inputProps?: any;
//   class?: string;
//   maxlength?: number;
//   disabled?: boolean;
// }

// export const InputField = ({
//     label,
//     value,
//     onInput,
//     type = "text",
//     id,
//     clearable = true,
//     startIcon,
//     endIcon,
//     inputProps,
//     class: className,
//     disabled = false,
//   }: InputFieldProps) => {
//     return (
//       <div className="relative flex items-center">
//         {startIcon && (
//           <div className="absolute top-1/2 left-2 -translate-y-1/2">
//             {startIcon}
//           </div>
//         )}
//         <input
//           type={type}
//           id={id}
//           placeholder=" "
//           className={`peer focus:border-primary w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none ${startIcon ? "pl-10" : ""} ${(clearable && value) || endIcon ? "pr-18" : ""} hover:border-gray-400 ${className}`}
//           value={value}
//           disabled={disabled}
//           onInput={
//             inputProps?.onInput ||
//             (event) => {
//               onInput?.(
//                 event.target ? (event.target as HTMLInputElement).value : "",
//               );
//             }
//           }
//           {...inputProps}
//         />
//         <label
//           htmlFor={id}
//           className={`peer-focus:text-primary absolute ${value ? "top-0 left-3 text-xs" : "top-1/2 left-4 text-base"} -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:left-3 peer-focus:-translate-y-1/2 peer-focus:bg-white peer-focus:text-xs ${startIcon ? "peer-focus:left-10" : ""}`}
//         >
//           {label}
//         </label>
//         <div
//           className={`absolute top-1/2 right-2 hidden -translate-y-1/2 items-center ${clearable ? "peer-[:not(:placeholder-shown):focus] peer-[:not(:placeholder-shown)]:flex" : ""}`}
//         >
//           {endIcon && <div className="ml-2">{endIcon}</div>}

//           <button
//             type="button"
//             className="ml-2 rounded-full p-1 hover:cursor-pointer hover:bg-gray-100"
//             id={"clear-" + inputProps?.name || id}
//             onClick={() => {
//               const input = document.getElementById(id) as HTMLInputElement;
//               if (input) {
//                 input.value = ""; // set empty value
//                 const event = new Event("input", { bubbles: true });
//                 input.dispatchEvent(event); // manually trigger input event
//               }
//             }}
//           >
//             <XMark />
//           </button>
//         </div>
//       </div>
//     );
//   };

// interface FormInputFieldProps extends InputFieldProps {
//   error: string;
//   errorClass?: string;
// }

// export const FormInputField = ({ error, errorClass, ...inputProps }: FormInputFieldProps) => {
//     return (
//       <>
//         <InputField
//           {...inputProps}
//           class={error ? "border-red-600" : undefined}
//         />
//         {error && (
//           <div className={errorClass}>
//             <ErrorMessage error={error} />
//           </div>
//         )}
//       </>
//     );
//   },
// );
