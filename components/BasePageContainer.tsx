interface IBaseScreenProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default ({ className, style, children }: IBaseScreenProps) => {
  return (
    <div
      className={[
        "`flex w-full max-w-375 flex-wrap overflow-hidden px-3 py-14 lg:px-35",
        className || "",
      ].join(" ")}
      style={style}
    >
      {children}
    </div>
  );
};
