import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Check,
  Search,
  FileText,
  MessageSquare,
  Target,
  GraduationCap,
  Scale,
  Briefcase,
  Home,
  Zap,
  List,
  Layout
} from 'lucide-react';
import { onboardUser } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshToken } = useAuth();

  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 2
  const [goal, setGoal] = useState('');
  // Step 3
  const [persona, setPersona] = useState('');
  // Step 4
  const [workStyle, setWorkStyle] = useState('');

  const goToStep = (newStep: number) => {
    if (newStep > 1 && (!firstName.trim() || !lastName.trim())) {
      setError('First name and last name are required to continue.');
      return;
    }
    if (newStep > 2 && !goal) {
       setError('Please select an option.');
       return;
    }
    if (newStep > 3 && !persona) {
       setError('Please select an option.');
       return;
    }

    setError('');
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
    }, 300); // 300ms transition
  };

  const handleBoxClick = (setter: (val: string) => void, value: string, nextStep: number) => {
    setter(value);
    // Auto advance after brief delay
    setTimeout(() => goToStep(nextStep), 200);
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !goal || !persona || !workStyle) {
      setError('Please complete all steps.');
      return;
    }
    setError('');
    setIsLoading(true);

    const generatedBio = `Goal: ${goal} | Style: ${workStyle}`;

    try {
      const data = await onboardUser({
        first_name: firstName,
        last_name: lastName,
        company: '', // Optional now
        role: persona,
        bio: generatedBio,
      });
      refreshToken(data.token);
      navigate('/workspace');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const OptionCard = ({ 
    icon: Icon, 
    title, 
    selected, 
    onClick 
  }: { 
    icon: any, 
    title: string, 
    selected: boolean, 
    onClick: () => void 
  }) => (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 ${
        selected 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
      }`}
    >
      <div className={`p-3 rounded-lg ${selected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`font-medium ${selected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Personalize your experience
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {step === 1 && "What's your name?"}
            {step === 2 && "What do you want to do?"}
            {step === 3 && "Who are you?"}
            {step === 4 && "How do you like to work?"}
          </h1>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden min-h-[440px]">
          <form onSubmit={handleSubmit}>
            
            {/* STEP 1 */}
            <div className={`transition-all duration-300 absolute inset-0 p-8 flex flex-col ${
              step === 1 && !isTransitioning ? 'opacity-100 translate-x-0 pointer-events-auto' : 
              step === 1 && isTransitioning ? 'opacity-0 -translate-x-10 pointer-events-none' : 
              'opacity-0 -translate-x-full pointer-events-none'
            }`}>
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Identity</h2>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    First name <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Last name <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => goToStep(2)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors mt-6"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 2 */}
            <div className={`transition-all duration-300 absolute inset-0 p-8 flex flex-col ${
              step === 2 && !isTransitioning ? 'opacity-100 translate-x-0 pointer-events-auto' : 
              step === 2 && isTransitioning && step > 1 ? 'opacity-0 translate-x-10 pointer-events-none' : 
              'opacity-0 translate-x-full pointer-events-none'
            }`}>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 pb-4">
                <OptionCard 
                  icon={Search} title="Understand a document" selected={goal === 'Understand a document'} 
                  onClick={() => handleBoxClick(setGoal, 'Understand a document', 3)} 
                />
                <OptionCard 
                  icon={FileText} title="Summarize it" selected={goal === 'Summarize it'} 
                  onClick={() => handleBoxClick(setGoal, 'Summarize it', 3)} 
                />
                <OptionCard 
                  icon={MessageSquare} title="Ask questions" selected={goal === 'Ask questions'} 
                  onClick={() => handleBoxClick(setGoal, 'Ask questions', 3)} 
                />
                <OptionCard 
                  icon={Target} title="Extract key info" selected={goal === 'Extract key info'} 
                  onClick={() => handleBoxClick(setGoal, 'Extract key info', 3)} 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => goToStep(1)} className="px-5 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium transition-colors text-sm">
                  Back
                </button>
                <button type="button" onClick={() => goToStep(3)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* STEP 3 */}
            <div className={`transition-all duration-300 absolute inset-0 p-8 flex flex-col ${
              step === 3 && !isTransitioning ? 'opacity-100 translate-x-0 pointer-events-auto' : 
              step === 3 && isTransitioning ? 'opacity-0 translate-x-10 pointer-events-none' : 
              'opacity-0 translate-x-full pointer-events-none'
            }`}>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 pb-4">
                <OptionCard 
                  icon={GraduationCap} title="Student" selected={persona === 'Student'} 
                  onClick={() => handleBoxClick(setPersona, 'Student', 4)} 
                />
                <OptionCard 
                  icon={Scale} title="Legal professional" selected={persona === 'Legal professional'} 
                  onClick={() => handleBoxClick(setPersona, 'Legal professional', 4)} 
                />
                <OptionCard 
                  icon={Briefcase} title="Business / work" selected={persona === 'Business / work'} 
                  onClick={() => handleBoxClick(setPersona, 'Business / work', 4)} 
                />
                <OptionCard 
                  icon={Home} title="Personal use" selected={persona === 'Personal use'} 
                  onClick={() => handleBoxClick(setPersona, 'Personal use', 4)} 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => goToStep(2)} className="px-5 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium transition-colors text-sm">
                  Back
                </button>
                <button type="button" onClick={() => goToStep(4)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* STEP 4 */}
            <div className={`transition-all duration-300 absolute inset-0 p-8 flex flex-col ${
              step === 4 && !isTransitioning ? 'opacity-100 translate-x-0 pointer-events-auto' : 
              'opacity-0 translate-x-full pointer-events-none'
            }`}>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 pb-4">
                <OptionCard 
                  icon={Zap} title="Fast and simple" selected={workStyle === 'Fast and simple'} 
                  onClick={() => setWorkStyle('Fast and simple')} 
                />
                <OptionCard 
                  icon={List} title="Detailed and thorough" selected={workStyle === 'Detailed and thorough'} 
                  onClick={() => setWorkStyle('Detailed and thorough')} 
                />
                <OptionCard 
                  icon={Layout} title="Visual and structured" selected={workStyle === 'Visual and structured'} 
                  onClick={() => setWorkStyle('Visual and structured')} 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => goToStep(3)} className="px-5 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium transition-colors text-sm">
                  Back
                </button>
                <button type="button" onClick={() => handleSubmit()} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Preparing...
                    </span>
                  ) : (
                    <>
                      Let's Go
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
        
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`}
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
