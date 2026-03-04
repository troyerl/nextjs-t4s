// import { $, component$, QRL } from "@builder.io/qwik";
// import ErrorMessage from "./ErrorMessage";
// import { XMark } from "../icons";

// interface TextAreaFieldProps {
//   id: string;
//   label: string;
//   value: string;
//   onInput$?: QRL<(value: string) => void>;
//   inputProps?: any;
//   rows?: number;
//   class?: string;
//   clearable?: boolean;
// }

// export const TextAreaField = component$<TextAreaFieldProps>(
//   ({
//     id,
//     label,
//     value,
//     onInput$,
//     inputProps,
//     rows = 4,
//     class: className,
//     clearable = true,
//   }) => {
//     return (
//       <div class="relative flex w-full items-center">
//         <textarea
//           id={id}
//           placeholder=" "
//           rows={rows}
//           value={value}
//           class={`peer focus:border-primary w-full rounded-md border border-gray-300 py-3 pr-10 pl-4 hover:border-gray-400 focus:outline-none ${className}`}
//           onInput$={
//             onInput$
//               ? $((event: InputEvent) =>
//                   onInput$?.(
//                     event.target
//                       ? (event.target as HTMLInputElement).value
//                       : "",
//                   ),
//                 )
//               : inputProps?.onInput$
//           }
//           {...inputProps}
//         />
//         <label
//           for={id}
//           class={`peer-focus:text-primary absolute ${value ? "top-0 left-3 text-xs" : "top-1/2 left-4 text-base"} -translate-y-1/2 bg-white px-1 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:left-3 peer-focus:-translate-y-1/2 peer-focus:bg-white peer-focus:text-xs`}
//         >
//           {label}
//         </label>
//         <div
//           class={`absolute top-2 right-2 hidden items-center ${clearable ? "peer-[:not(:placeholder-shown):focus] peer-[:not(:placeholder-shown)]:flex" : ""}`}
//         >
//           <button
//             type="button"
//             class="ml-2 rounded-full p-1 hover:cursor-pointer hover:bg-gray-100"
//             id={"clear-" + inputProps?.name}
//             onClick$={$(() => {
//               const input = document.getElementById(id) as HTMLInputElement;
//               if (input) {
//                 input.value = ""; // set empty value
//                 const event = new Event("input", { bubbles: true });
//                 input.dispatchEvent(event); // manually trigger input event
//               }
//             })}
//           >
//             <XMark />
//           </button>
//         </div>
//       </div>
//     );
//   },
// );

// interface FormTextAreaFieldProps extends TextAreaFieldProps {
//   error: string;
// }

// export const FormTextAreaField = component$<FormTextAreaFieldProps>(
//   ({ error, ...inputProps }) => {
//     return (
//       <>
//         <TextAreaField
//           {...inputProps}
//           class={error ? "border-red-600" : undefined}
//         />
//         {error && <ErrorMessage error={error} />}
//       </>
//     );
//   },
// );
