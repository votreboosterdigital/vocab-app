interface LondonSkylineProps {
  height?: number;
  className?: string;
  animated?: boolean;
}

export default function LondonSkyline({
  height = 150,
  className = "",
  animated = true,
}: LondonSkylineProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #dce8ff 0%, #eef3ff 60%, #f5e8ff 100%)",
        }}
      />

      {/* Background buildings (blue-tinted) */}
      <div className="absolute bottom-8 left-0 right-0 flex items-end gap-1 px-2 opacity-40">
        {[28, 40, 22, 50, 32, 44, 26, 36, 24, 42, 30, 38].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: h, background: "#8aafdd" }}
          />
        ))}
      </div>

      {/* Parliament / Westminster silhouette */}
      <div className="absolute bottom-8 left-4 flex items-end gap-px">
        {/* Main building */}
        <div className="w-16 h-10 rounded-t-sm" style={{ background: "#4a6fa5" }} />
        {/* Towers */}
        <div className="w-3 h-14 rounded-t-sm" style={{ background: "#3d5c8a" }} />
        <div className="w-2 h-10 rounded-t-sm" style={{ background: "#4a6fa5" }} />
        <div className="w-4 h-12 rounded-t-sm" style={{ background: "#3d5c8a" }} />
      </div>

      {/* Big Ben */}
      <div className="absolute bottom-8 left-16 flex flex-col items-center">
        {/* Clock face */}
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
          style={{ background: "#f0d080", borderColor: "#8a6a20" }}
        >
          <div className="w-1 h-1 rounded-full" style={{ background: "#8a6a20" }} />
        </div>
        {/* Tower */}
        <div
          className="w-7 flex flex-col items-center"
          style={{ background: "#e8c875" }}
        >
          <div className="w-full h-3" style={{ background: "#e8c875" }} />
          <div className="w-full h-12" style={{ background: "#d4a843" }} />
        </div>
        {/* Base */}
        <div className="w-9 h-3 rounded-sm" style={{ background: "#c49520" }} />
        {/* Flag pole */}
        <div
          className="absolute -top-4 right-0 w-px h-4"
          style={{ background: "#555" }}
        />
        {/* Union Jack (simplified) */}
        <div
          className="absolute -top-5 right-0 w-5 h-3 rounded-sm"
          style={{
            background: "linear-gradient(135deg, #C8102E 30%, #ffffff 40%, #2B3A8C 50%, #ffffff 60%, #C8102E 70%)",
          }}
        />
      </div>

      {/* Red Phone Box */}
      <div className="absolute bottom-8 right-24 flex flex-col items-center">
        <div
          className="w-6 h-12 rounded-t-sm flex flex-col"
          style={{ background: "#C8102E" }}
        >
          <div className="h-3 flex items-center justify-center">
            <div className="w-4 h-1 rounded-sm" style={{ background: "#ffdd99" }} />
          </div>
          <div className="flex-1 mx-1 rounded-sm" style={{ background: "#a8d8ea" }} />
        </div>
        <div className="w-7 h-1 rounded-sm" style={{ background: "#991010" }} />
      </div>

      {/* Thames river */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8"
        style={{
          background: "linear-gradient(180deg, #a8d0f0 0%, #7ab8e8 100%)",
        }}
      />

      {/* Animated red double-decker bus */}
      <div className={`absolute bottom-8 ${animated ? "animate-bus-ride" : ""}`} style={{ bottom: "2rem" }}>
        <div className="flex flex-col" style={{ width: 44 }}>
          {/* Top deck */}
          <div
            className="rounded-t-md flex items-center justify-around px-1"
            style={{ background: "#C8102E", height: 14 }}
          >
            <div className="w-3 h-2 rounded-sm" style={{ background: "#d4eaf7" }} />
            <div className="w-3 h-2 rounded-sm" style={{ background: "#d4eaf7" }} />
          </div>
          {/* Bottom deck */}
          <div
            className="flex items-center justify-around px-1"
            style={{ background: "#a80e26", height: 14 }}
          >
            <div className="w-3 h-2 rounded-sm" style={{ background: "#d4eaf7" }} />
            <div className="w-3 h-2 rounded-sm" style={{ background: "#d4eaf7" }} />
          </div>
          {/* Wheels */}
          <div className="flex justify-between px-1">
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{ background: "#333", borderColor: "#666" }}
            />
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{ background: "#333", borderColor: "#666" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
