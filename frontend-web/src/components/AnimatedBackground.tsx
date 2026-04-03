export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-[#070b13] to-[#040608]">
      {/* Cyan Blob */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-700/20 blur-[140px] mix-blend-screen animate-blob"
      />
      
      {/* Purple/Indigo Blob */}
      <div 
        className="absolute top-[10%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-purple-700/20 blur-[130px] mix-blend-screen animate-blob" 
        style={{ animationDelay: '2s' }}
      />
      
      {/* Blue Blob */}
      <div 
        className="absolute bottom-[-15%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-700/20 blur-[150px] mix-blend-screen animate-blob" 
        style={{ animationDelay: '4s' }}
      />
      
      {/* Medical Emerald Blob */}
      <div 
        className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen animate-blob" 
        style={{ animationDelay: '6s' }}
      />

      {/* Dim overlay for text readability completely across screen */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
    </div>
  )
}
