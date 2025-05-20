import Navigation from "../components/naigation"

export default function Home() {
  window.location.href = "/add"
  return (
    <>
      <Navigation/>
      <h2>Home</h2>
    </>
  );
}
