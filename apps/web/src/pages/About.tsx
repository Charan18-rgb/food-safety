export default function About() {
  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900">About FoodGrade</h1>
      
      <section className="space-y-2">
        <h2 className="text-lg font-bold">What is FoodGrade?</h2>
        <p className="text-gray-700">A transparent food ingredient and nutritional assessment application.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Methodology</h2>
        <p className="text-gray-700">FoodGrade Algorithm v1.0 uses:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Nutritional Balance</li>
          <li>Ingredient Quality</li>
          <li>Additive / Processing</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-red-600">Important disclaimer</h2>
        <p className="text-gray-700 font-medium">
          FoodGrade's A-E grade is an application-specific assessment.
          It is not an official FSSAI grading system and is not medical advice.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Data</h2>
        <p className="text-gray-700">Product information may originate from:</p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>barcode database</li>
          <li>user-provided label</li>
          <li>OCR</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Privacy</h2>
        <p className="text-gray-700">
          Scan history is stored locally on your device. Images captured for OCR are processed by our vision pipeline but are not retained permanently.
        </p>
      </section>
    </div>
  );
}
