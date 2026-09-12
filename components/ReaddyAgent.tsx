import Script from "next/script";

export default function ReaddyAgent() {
  return (
    <Script
      src="https://readdy.ai/api/public/assistant/widget?projectId=18288eee-63fa-4165-a658-6aa7ab020255"
      strategy="afterInteractive"
      mode="hybrid"
      voice-show-transcript="true"
      theme="light"
      size="compact"
      accent-color="#14B8A6"
      button-base-color="#000000"
      button-accent-color="#FFFFFF"
    />
  );
}