# V2 design direction

## Why revisit the current trainer

The current design treats each short functional pattern and practice direction as an independent card scheduled by SRS. That is a useful implementation of retrieval practice, but it does not match the learning problem closely enough.

Musical hearing is context-dependent. A scale degree does not have one invariant perceptual feeling independent of what precedes and follows it, its register, the harmony, or its rhythmic and phrase position. `1-2-3` and `1-5-2` both contain 2, but they may be experienced and produced as substantially different gestures. Likewise, recently hearing `1-3` may make `1-3-5` temporarily easy, while an intervening 2 may disrupt access to 3. Immediate performance therefore reflects both longer-term learning and the short-term musical context created by the preceding practice.

SRS assumes that items are sufficiently independent for their recall histories to be scheduled separately. Exact musical patterns overlap, prime, interfere with, and generalize to one another. A correct response to one pattern is not simply evidence for that pattern alone, while an uncertain response is not necessarily evidence that nothing useful happened.

The card model also encourages a closed practice environment. If the learner is told that every prompt contains only `1`, `3`, and `5`, they can succeed partly by relying on that reduced palette. Removing the restriction can then feel disorienting because the practice environment supplied information that is absent from music.

V2 should not attempt to infer a perfect cognitive representation or build a complete model of musical skill. It needs a good-enough learning environment that preserves the important information in musical performance, makes early success possible, and helps a self-coaching learner decide what to do next.

## Learning principles

### Preserve the performance problem

The eventual task is to hear music, orient within it, understand something about its organization, and respond by singing, naming, or playing. Practice should simplify that task without reducing it to isolated stimuli that remove melody, register, rhythm, harmony, and surrounding notes.

This is task simplification rather than task decomposition. The learner should continue to encounter musical phrases and make musically relevant responses while temporary constraints make useful information easier to detect.

### Bias the environment rather than close it

Early material can make tonic, a harmonic arrival, or a melodic gesture unusually clear through repetition, phrase position, meter, accompaniment, or strong expectation. Competing notes should not necessarily disappear entirely. The goal is to make the relevant organization available, not make elimination the only successful strategy.

A useful progression moves through:

- clear and strongly supported examples;
- contrasts that direct attention toward an important distinction;
- the same opportunity in varied contexts;
- the opportunity embedded among competing material;
- open musical situations where no target or answer set is promised.

### Treat support and interference as practice variables

Blocked or closely related practice can help a learner find a workable organization and experience success. More varied or contrasting practice tests whether that organization can be reconstructed when it is no longer fresh. Both are useful.

A supported success should not be mistaken for independent fluency, but it is still a meaningful part of acquisition. Difficulty should be increased by altering the surrounding information, delaying the response, changing the musical context, or embedding the target more deeply—not only by waiting longer before repeating an item.

### Couple recognition and production

Recognition and production are not completely separate tracks. “Hear a melody and sing its tonic” requires the learner to organize what they heard and then externalize that organization. Completion, joining, imitation, and singing selected events similarly connect perception to action.

Production can be made easier without constraining the set of notes the learner is physically allowed to sing. A phrase can strongly invite a tonic arrival, expose a stable harmonic relationship, or offer a stepwise path toward a note. As support fades, the learner must increasingly organize and produce the response independently.

### Support self-coaching

The learner can often tell whether an activity feels easy, impossible, productive, misleading, or unrelated to the capacity they want to develop. V2 should use that judgment instead of hiding practice behind an opaque scheduler.

The central coaching question is: **what should I do next?** The environment should make a small set of useful next moves available:

- make the same problem clearer;
- repeat it with a nearby variation;
- weaken one support;
- add one source of interference;
- place it in a larger phrase;
- try it in unfamiliar material;
- return to a simpler or more representative task;
- switch questions when the current activity is not getting at the desired skill.

The system may suggest a next move, but the learner remains responsible for judging whether the task is producing useful attention and adaptation.

## Organize practice around musical questions

Rather than presenting a library of knowledge items, the environment can present questions that may be asked of complete musical material:

- Where is home?
- Which events are tonic?
- What approaches or leaves home?
- Where does the melody settle or remain unresolved?
- Where does the harmony leave and return?
- What changed between two versions?
- Can I join, complete, reproduce, name, or play what I perceived?

Different activities can ask the same question with different constraints. This supplies variety without claiming that each activity or excerpt is an independent memory to master.

## Repertoire and novel material

Familiar songs are ecologically meaningful, but they are not clean evidence that the learner oriented from the currently available musical information. Existing memory may supply the melody and its continuation before the learner hears or analyzes it.

Familiar repertoire remains useful for:

- demonstrating what a musical question means;
- attaching labels to already familiar events;
- examining function across a complete phrase or song;
- motivating practice through recognizable musical outcomes;
- checking eventual transfer back into real repertoire.

Ordinary practice should also use unfamiliar but idiomatic melodies. They must sound like music—metered, phrased, singable, and tonally organized—while being unfamiliar enough that rote melodic memory cannot solve the task.

The starting content strategy is a substantially larger corpus of complete simple songs. Songs are stored with scale degree, register, rhythm, meter, measures, phrase boundaries, tonal context, and provenance. Exercises select and transform information from complete scores at runtime; the corpus is not committed in advance to one pattern decomposition.

A larger authentic corpus is the first source of varied material. Human-authored miniatures and constrained corpus-guided generation remain possible later if the available repertoire does not provide enough examples for a useful practice condition.

## Build scale-degree concepts across contexts

A scale degree is both invariant and context-dependent. `3` has the same relationship to tonic in `1-2-3`, `1-3-5`, and `1-4-3`, but its melodic role, expectation, and felt quality differ in each gesture. V2 should not teach a context-free auditory essence of `3`, nor treat each occurrence as an unrelated item. It should help the learner form a useful equivalence across varied musical experiences.

Varied exposure alone may not make that invariant emerge. Activities should combine musical context with attention, comparison, labeling, and use:

- encounter the degree in several meaningful gestures, phrases, keys, registers, and rhythmic positions;
- reveal or ask which events instantiate the degree;
- contrast it with nearby degrees and compare its behavior across contexts;
- transpose material so the common relationship cannot be reduced to absolute pitch;
- use the label to recognize, imagine, sing, join, complete, or transform music.

Promising activities include:

- hearing `1-2` and singing what comes next;
- hearing `1-5` and filling in the missing `3`;
- hearing a phrase and identifying every event from a situation-derived answer vocabulary;
- joining or reproducing only the `3` events while or after a phrase plays;
- comparing examples such as `1-2-3`, `1-3-5`, and `1-4-3` to notice what remains stable and what changes.

These activities connect implicit expectation and audiation to an explicit tonal representation. Completing `1-2` successfully is not yet evidence that the learner understands the result as `3`; the activity becomes concept-building when the learner can connect that sound and label across unfamiliar contexts. Whether this transfer emerges is an empirical product hypothesis to observe rather than assume.

## Start with situation-driven note identification

Tonic remains the organizing reference for melody and later harmonic work, but the first environment should let the learner practice note functions in concrete melodic situations rather than splitting tonic singing and tonic-event recognition into separate activities.

The initial activity is **Identify the notes**:

- Before practice, choose any combination from a flat catalog of musical situations.
- Situations include tonic, direct tonic–dominant and tonic–third motion, movement within the tonic triad, and stepwise windows around individual scale degrees.
- The selected situations determine both which melody phrases may be sampled and which scale-degree answers appear.
- Present neutral event positions without revealing their pitches, while retaining authored rhythm, register, and phrase structure in playback.
- Ask for one answer for every sounded melody event; events outside the selected vocabulary remain visible and are answered as `other`.
- Reveal each actual note and the correctness of the learner's answer.
- Allow replay, optional key and drone support, situation changes, and another melody.

Situations are independent practice-selection units, not levels or prerequisites. They may overlap, and selecting several should give each covered situation an equal opportunity to drive phrase sampling even when their corpus frequencies differ. The phrase remains the source of tonal orientation; the situation that selected it is sampling provenance, not a highlighted target or a separate correctness rule.

## Directions that can grow from note identification

Possible subsequent tasks should remain open until experience with the corpus and the note-identification activity clarifies what is useful. Promising extensions include:

- completing arrivals such as `5-1`, `5↓-1`, `7-1`, and `2-1`;
- identifying where a melody approaches, reaches, delays, or avoids tonic;
- maintaining tonic while another note becomes locally prominent;
- joining only tonic events while a melody plays;
- comparing a phrase that arrives home with one that diverts elsewhere;
- hearing tonic harmony versus movement away from it;
- hearing dominant-to-tonic arrival before attaching Roman-numeral labels;
- developing chord-quality discrimination as a related but distinct perceptual question;
- exploring common harmonic movements such as predominant–dominant–tonic once harmonic orientation is available;
- locating melodic or harmonic gestures inside longer unfamiliar material.

Major/minor chord discrimination, tonic recognition, harmonic function, melodic segmentation, and vocal production should not be assumed to be one hierarchy. They may develop in parallel and inform one another. The environment can expose their relationships without requiring a definitive prerequisite graph.

## Difficulty as manipulated constraints

V2 does not initially need a single numerical difficulty score. Difficulty can be adjusted through observable properties of the task and material:

- whole song versus short phrase;
- familiar versus unfamiliar material;
- strong versus ambiguous tonal closure;
- target repeated versus appearing once;
- target at a phrase boundary versus embedded internally;
- immediate imitation versus delayed production;
- stable accompaniment versus melody alone;
- short versus long response;
- narrow versus wide register;
- simple versus complex rhythm;
- isolated contrast versus multiple plausible alternatives;
- one changed variable versus several simultaneous changes.

When the learner cannot organize a response, the next task can strengthen one useful source of information. When success becomes automatic, the next task can alter one constraint while preserving the same musical question. If performance collapses, one support can return without removing the new challenge entirely.

## Deliberately deferred decisions

The initial note-identification experiment does not decide:

- what the persistent unit of learning is;
- whether any SRS remains useful;
- whether patterns, gestures, questions, or practice areas appear in a future library;
- how learner progress should be summarized;
- whether the environment should recommend or automatically choose the next task;
- how familiar and unfamiliar material should be balanced;
- whether generated melodies are necessary;
- how recognition, production, harmony, and transcription should eventually be integrated;
- whether microphone input should provide optional feedback.

Those decisions should follow observation of real practice rather than precede it.

## First implementation step

The current implementation uses the complete timed-song corpus for one situation-driven note-identification activity. The selected situations are a flat practice configuration rather than a mastery model or prerequisite graph.
