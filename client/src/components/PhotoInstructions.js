import React from 'react';
import { Camera, Sun, Eye, Users, FileImage } from 'lucide-react';

function PhotoInstructions() {
  const instructions = [
    {
      icon: <Camera className="w-8 h-8 text-primary-600" />,
      title: "Pokaż produkt w akcji",
      description: "Upewnij się, że meble lub akcesoria są w pełni złożone, bez kartonów i folii. Najlepiej uchwyć je w naturalnym otoczeniu – na tarasie, w ogrodzie, pod pergolą."
    },
    {
      icon: <Sun className="w-8 h-8 text-primary-600" />,
      title: "Wybierz dobre światło",
      description: "Rób zdjęcia w ciągu dnia. Naturalne światło podkreśli kolory i detale. Unikaj nocnych ujęć czy silnego sztucznego oświetlenia."
    },
    {
      icon: <Eye className="w-8 h-8 text-primary-600" />,
      title: "Uchwyć szczegóły",
      description: "Pokaż z bliska elementy, które cenisz – np. strukturę technorattanu, system regulacji pergoli, wygodne poduchy czy funkcjonalność stołu. To właśnie te detale inspirują innych."
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Kadruj bez osób",
      description: "Ze względu na RODO prosimy, aby na zdjęciach nie było twarzy czy osób. Możesz za to dodać ulubione dekoracje, rośliny czy zwierzaki 🐾."
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12" id="photo-instructions">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Jak zrobić świetne zdjęcia do opinii? 🌿
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Twoje zdjęcie może trafić na stronę FocusGarden i nasze social media – pochwal się swoim ogrodem!
          </p>
        </div>

        {/* Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {instructions.map((instruction, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  {instruction.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {index + 1}. {instruction.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {instruction.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-primary-50 rounded-lg p-6 max-w-4xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileImage className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Zadbaj o jakość pliku
              </h3>
              <p className="text-primary-800">
                Zdjęcia powinny mieć minimum 1600 px szerokości i ważyć maksymalnie 5 MB. 
                Dzięki temu świetnie zaprezentują się na stronie FocusGarden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoInstructions;
