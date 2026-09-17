# Artificial Intelligence: Study Notes

B.Tech CSE (AI) · Evaluation notes set for Aurel

---

## Unit 1: Introduction to AI

### 1.1 What is Artificial Intelligence?

Artificial Intelligence (AI) is the study and design of computer systems that perform tasks which normally need human intelligence, such as reasoning, learning, planning, understanding language and perceiving the world.

Russell and Norvig group definitions of AI into four approaches:

| | Human-like | Rational |
| --- | --- | --- |
| **Thinking** | Thinking humanly (cognitive modelling) | Thinking rationally (laws of thought, logic) |
| **Acting** | Acting humanly (Turing test) | Acting rationally (rational agent approach) |

Modern AI mostly follows the **rational agent** approach: build agents that do the right thing, meaning the action expected to achieve the best outcome.

### 1.2 The Turing Test

Proposed by Alan Turing in 1950 in the paper "Computing Machinery and Intelligence". A human interrogator chats in text with a hidden human and a hidden machine. If the interrogator cannot reliably tell which is the machine, the machine is said to pass the test.

To pass, a machine needs:

- natural language processing, to communicate;
- knowledge representation, to store what it knows;
- automated reasoning, to answer questions and draw conclusions;
- machine learning, to adapt and find patterns.

The **total Turing test** adds computer vision and robotics, so the machine can perceive and handle objects.

### 1.3 Strong AI and Weak AI

- **Weak (narrow) AI:** a system built for one task, such as playing chess or recognising faces. All AI in use today is narrow.
- **Strong AI (Artificial General Intelligence, AGI):** a system with general intelligence across any task a human can do. It does not exist yet.

### 1.4 Brief history

- 1943: McCulloch and Pitts propose a model of artificial neurons.
- 1950: Turing publishes the Turing test.
- 1956: The Dartmouth workshop, organised by John McCarthy, coins the term "Artificial Intelligence".
- 1970s and late 1980s: "AI winters", when funding fell after early promises were not met.
- 1980s: Expert systems become popular in industry.
- 1997: IBM's Deep Blue defeats world chess champion Garry Kasparov.
- 2012 onwards: Deep learning succeeds in image recognition (AlexNet), speech and language.
- 2016: DeepMind's AlphaGo defeats Lee Sedol at Go.

### 1.5 Applications

Healthcare diagnosis, recommendation systems, self-driving cars, speech assistants, machine translation, fraud detection, game playing and robotics.

---

## Unit 2: Intelligent Agents

### 2.1 Agents and environments

An **agent** is anything that perceives its **environment** through **sensors** and acts on it through **actuators**.

- **Percept:** the agent's input at one moment.
- **Percept sequence:** the complete history of everything the agent has perceived.
- **Agent function:** maps any percept sequence to an action (abstract description).
- **Agent program:** the concrete implementation that runs on the agent's architecture.

Agent = architecture + program.

### 2.2 Rationality

A **rational agent** chooses, for each percept sequence, the action expected to maximise its **performance measure**, given its percepts and built-in knowledge.

Rationality depends on four things:

1. the performance measure that defines success;
2. the agent's prior knowledge of the environment;
3. the actions it can perform;
4. its percept sequence so far.

Rational is not the same as omniscient. A rational agent maximises *expected* performance, not actual performance.

### 2.3 PEAS description

A task environment is specified with **PEAS**: Performance measure, Environment, Actuators, Sensors.

Example, an automated taxi driver:

| PEAS | Automated taxi |
| --- | --- |
| Performance | Safe, fast, legal, comfortable trip; maximise profit |
| Environment | Roads, other traffic, pedestrians, customers |
| Actuators | Steering, accelerator, brake, signal, horn, display |
| Sensors | Cameras, sonar, speedometer, GPS, odometer, engine sensors |

### 2.4 Properties of task environments

| Property | Meaning | Example |
| --- | --- | --- |
| Fully vs partially observable | Can sensors see the complete relevant state? | Chess is fully observable; poker is partially observable |
| Deterministic vs stochastic | Is the next state fully decided by the current state and action? | Chess is deterministic; driving is stochastic |
| Episodic vs sequential | Do current decisions affect future ones? | Image classification is episodic; chess is sequential |
| Static vs dynamic | Can the environment change while the agent thinks? | Crossword is static; driving is dynamic |
| Discrete vs continuous | Finite distinct states and actions, or continuous ones? | Chess is discrete; driving is continuous |
| Single vs multi-agent | Are other agents present? | Crossword is single-agent; chess is multi-agent |
| Known vs unknown | Does the agent know the rules (outcomes of actions)? | |

### 2.5 Types of agent programs

1. **Simple reflex agents:** act only on the current percept using condition-action rules ("if car in front is braking, then brake"). Work only in fully observable environments.
2. **Model-based reflex agents:** keep an internal state (a model of how the world works) to handle partial observability.
3. **Goal-based agents:** use goals and search or planning to choose actions that reach a goal.
4. **Utility-based agents:** use a utility function that measures how desirable a state is, so they can trade off conflicting goals and uncertainty.
5. **Learning agents:** have a learning element (improves), performance element (chooses actions), critic (gives feedback against a standard) and problem generator (suggests exploratory actions).

---

## Unit 3: Problem Solving by Search

### 3.1 Problem formulation

A search problem has:

- **Initial state:** where the agent starts.
- **Actions:** what the agent can do in each state.
- **Transition model:** the result of doing an action in a state.
- **Goal test:** checks whether a state is a goal.
- **Path cost:** a function that gives a numeric cost to each path; the step cost is the cost of one action.

A **solution** is a sequence of actions from the initial state to a goal. An **optimal solution** has the lowest path cost.

Example, the 8-puzzle: states are tile arrangements, actions move the blank Left, Right, Up or Down, the goal is a fixed arrangement, and each move costs 1.

### 3.2 Measuring search strategies

- **Completeness:** does it always find a solution if one exists?
- **Optimality:** does it find the lowest-cost solution?
- **Time complexity:** how many nodes are generated?
- **Space complexity:** how many nodes are kept in memory?

Notation: **b** = branching factor, **d** = depth of the shallowest goal, **m** = maximum depth of the search tree.

### 3.3 Uninformed (blind) search

These strategies use no knowledge beyond the problem definition.

| Strategy | Frontier | Complete? | Optimal? | Time | Space |
| --- | --- | --- | --- | --- | --- |
| Breadth-first search (BFS) | FIFO queue | Yes (finite b) | Yes, if all step costs are equal | O(b^d) | O(b^d) |
| Uniform-cost search (UCS) | Priority queue ordered by path cost g(n) | Yes (step costs ≥ ε > 0) | Yes | O(b^(1+⌊C*/ε⌋)) | same as time |
| Depth-first search (DFS) | LIFO stack | No (infinite paths, loops) | No | O(b^m) | O(bm) |
| Depth-limited search | DFS with depth limit l | No (if l < d) | No | O(b^l) | O(bl) |
| Iterative deepening DFS (IDDFS) | DFS with limits 0, 1, 2, ... | Yes | Yes, if step costs are equal | O(b^d) | O(bd) |
| Bidirectional search | Two searches meeting in the middle | Yes (with BFS) | Yes (with BFS, equal costs) | O(b^(d/2)) | O(b^(d/2)) |

Key points:

- BFS uses a lot of memory; memory, not time, is usually its main problem.
- DFS uses little memory but can get stuck down an infinite path.
- **IDDFS** combines the low memory of DFS with the completeness and optimality of BFS. It is the preferred uninformed method when the search space is large and the depth of the solution is unknown. The repeated work is small because most nodes are at the bottom level.
- **UCS** expands the node with the lowest path cost g(n). It is the same as Dijkstra's algorithm on a graph.

### 3.4 Informed (heuristic) search

A **heuristic function h(n)** estimates the cost of the cheapest path from node n to a goal.

**Greedy best-first search** expands the node with the lowest h(n). It is fast but is neither complete (in tree search) nor optimal.

**A\* search** expands the node with the lowest

> f(n) = g(n) + h(n)

where g(n) is the cost so far to reach n and h(n) is the estimated cost from n to the goal. So f(n) is the estimated cost of the cheapest solution through n.

**Admissible heuristic:** h(n) never overestimates the true cost h\*(n) to reach the goal, that is, h(n) ≤ h\*(n) for every n. With an admissible heuristic, A\* tree search is optimal.

**Consistent (monotonic) heuristic:** for every node n and every successor n' reached by action a,

> h(n) ≤ c(n, a, n') + h(n')

This is a form of the triangle inequality. Every consistent heuristic is also admissible. With a consistent heuristic, A\* graph search is optimal and f(n) never decreases along a path.

A\* is complete and optimal (under the conditions above) and **optimally efficient**: no other optimal algorithm using the same heuristic is guaranteed to expand fewer nodes. Its main drawback is memory, since it keeps all generated nodes.

### 3.5 Worked example: A\* search

Graph (directed edges with step costs):

- S → A cost 1, S → B cost 4
- A → B cost 2, A → G cost 12
- B → G cost 5

Heuristic: h(S) = 7, h(A) = 6, h(B) = 4, h(G) = 0. This heuristic is consistent (for example h(A) = 6 ≤ c(A,B) + h(B) = 2 + 4 = 6).

Trace (f = g + h):

1. Expand S. Add A (g=1, f=7) and B (g=4, f=8).
2. Expand A (f=7). Add B via A (g=3, f=7) and G via A (g=13, f=13).
3. Expand B (g=3, f=7). Add G via B (g=8, f=8).
4. Expand G (f=8). Goal reached.

Answer: the optimal path is **S → A → B → G** with cost **1 + 2 + 5 = 8**. Greedy best-first search would have chosen B first (lowest h) and could return S → B → G with cost 9, which is not optimal.

### 3.6 Heuristics for the 8-puzzle

- **h1 = number of misplaced tiles.**
- **h2 = sum of Manhattan distances** of each tile from its goal position.

Both are admissible. h2 **dominates** h1 (h2(n) ≥ h1(n) for all n), so A\* with h2 expands fewer nodes. Admissible heuristics can be made from **relaxed problems**: h1 is the exact cost if a tile could jump anywhere; h2 is the exact cost if a tile could move to any adjacent square, even an occupied one.

### 3.7 Local search

Local search keeps only the current state and moves to neighbours. It uses very little memory and suits optimisation problems where the path does not matter (such as the 8-queens problem).

- **Hill climbing:** always moves to the best neighbour. It can get stuck at **local maxima**, **plateaus** and **ridges**. Remedies are random restarts and sideways moves.
- **Simulated annealing:** sometimes accepts worse moves with probability e^(ΔE/T), where T (temperature) decreases over time. This lets it escape local maxima.
- **Local beam search:** keeps k states instead of one.
- **Genetic algorithms:** keep a population of states and create new ones through **selection**, **crossover** and **mutation**, guided by a **fitness function**.

---

## Unit 4: Adversarial Search (Games)

### 4.1 Games as search

Two-player, zero-sum games with perfect information (such as chess and tic-tac-toe) are defined by an initial state, the player to move, actions, a transition model, a terminal test and a **utility function** that scores terminal states (for example +1 win, 0 draw, −1 loss).

### 4.2 Minimax

The two players are **MAX** (tries to maximise utility) and **MIN** (tries to minimise it). The minimax value of a node is:

- the utility, if the node is terminal;
- the maximum of its children's values, if MAX is to move;
- the minimum of its children's values, if MIN is to move.

Minimax is a depth-first exploration of the game tree. It is complete for finite trees and optimal against an optimal opponent. Time is O(b^m) and space is O(bm).

### 4.3 Alpha-beta pruning

Alpha-beta pruning returns the same move as minimax but skips branches that cannot affect the final decision.

- **α (alpha):** the best (highest) value found so far for MAX along the path.
- **β (beta):** the best (lowest) value found so far for MIN along the path.
- A branch is pruned when **α ≥ β**.

With perfect move ordering, alpha-beta examines O(b^(m/2)) nodes, so it can search about twice as deep as minimax in the same time. With random ordering it is about O(b^(3m/4)).

**Worked example:** the root is a MAX node with two MIN children.

- Left MIN node has leaves 3 and 5, so its value is 3. Now α = 3 at the root.
- Right MIN node's first leaf is 2. The right node's value is now at most 2, which is less than α = 3, so MAX will never choose it. Its remaining leaf (9) is **pruned**.
- Root value = max(3, ≤2) = **3**. MAX chooses the left move.

### 4.4 Imperfect real-time decisions

Real games are too big to search to the end, so programs cut off the search at a depth limit and apply an **evaluation function** that estimates the utility of a position (for example a weighted sum of material in chess). **Quiescence search** extends the search in unstable positions (such as pending captures) to reduce the **horizon effect**.

Games with chance (like backgammon) use **expectiminimax**, which adds chance nodes whose value is the probability-weighted average of their children.

---

## Unit 5: Constraint Satisfaction Problems (CSP)

### 5.1 Definition

A CSP has:

- a set of **variables** X1, ..., Xn;
- a **domain** of possible values for each variable;
- a set of **constraints** that limit which combinations of values are allowed.

A **solution** is a complete, consistent assignment: every variable has a value and no constraint is violated.

Example, map colouring of Australia: variables are the regions (WA, NT, SA, Q, NSW, V, T), each domain is {red, green, blue}, and adjacent regions must have different colours.

### 5.2 Solving CSPs

- **Backtracking search:** a depth-first search that assigns one variable at a time and backtracks when a variable has no legal value.
- **Variable ordering:** choose the **minimum remaining values (MRV)** variable first (the most constrained), and break ties with the **degree heuristic** (the variable involved in the most constraints with unassigned variables).
- **Value ordering:** try the **least constraining value** first.
- **Forward checking:** after assigning a variable, remove inconsistent values from the domains of its unassigned neighbours; backtrack early if any domain becomes empty.
- **Arc consistency (AC-3):** a variable X is arc-consistent with Y if for every value of X there is some allowed value of Y. AC-3 repeatedly removes values until all arcs are consistent.

---

## Unit 6: Knowledge Representation and Logic

### 6.1 Knowledge-based agents

A knowledge-based agent has a **knowledge base (KB)**, a set of sentences in a formal language. It uses **TELL** to add sentences and **ASK** to query what follows from them.

### 6.2 Propositional logic

- **Syntax:** atomic propositions (P, Q) combined with connectives ¬ (not), ∧ (and), ∨ (or), ⇒ (implies), ⇔ (if and only if).
- **Semantics:** a **model** assigns true or false to every symbol.
- **Entailment (KB ⊨ α):** α is true in every model in which KB is true.
- **Valid sentence (tautology):** true in all models, such as P ∨ ¬P.
- **Satisfiable sentence:** true in at least one model.
- **Unsatisfiable sentence:** true in no model, such as P ∧ ¬P.

P ⇒ Q is false only when P is true and Q is false. It is equivalent to ¬P ∨ Q.

Important equivalences:

- De Morgan: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q and ¬(P ∨ Q) ≡ ¬P ∧ ¬Q.
- Contraposition: P ⇒ Q ≡ ¬Q ⇒ ¬P.
- Biconditional elimination: P ⇔ Q ≡ (P ⇒ Q) ∧ (Q ⇒ P).

**Inference rules:**

- **Modus ponens:** from P ⇒ Q and P, infer Q.
- **And-elimination:** from P ∧ Q, infer P.
- **Resolution:** from (A ∨ B) and (¬B ∨ C), infer (A ∨ C).

A procedure is **sound** if it derives only entailed sentences, and **complete** if it can derive every entailed sentence. Resolution is sound and complete for propositional logic (refutation-complete).

### 6.3 Conjunctive Normal Form (CNF) and resolution

CNF is a conjunction (AND) of clauses, where each clause is a disjunction (OR) of literals. Steps to convert:

1. Eliminate ⇔, then ⇒ (replace P ⇒ Q with ¬P ∨ Q).
2. Move ¬ inwards using De Morgan's laws and double negation.
3. Distribute ∨ over ∧.

**Proof by resolution (refutation):** add the negation of the goal to the KB, convert to CNF, and keep resolving clauses. If the empty clause is derived, the KB entails the goal.

**Worked example:** KB = {P ⇒ Q, Q ⇒ R, P}. Prove R.

- CNF clauses: (¬P ∨ Q), (¬Q ∨ R), (P). Add the negated goal (¬R).
- Resolve (¬R) with (¬Q ∨ R) to get (¬Q).
- Resolve (¬Q) with (¬P ∨ Q) to get (¬P).
- Resolve (¬P) with (P) to get the **empty clause**.
- Contradiction, so KB ⊨ R.

### 6.4 Forward and backward chaining

Both work on **Horn clauses** (clauses with at most one positive literal, such as P ∧ Q ⇒ R).

- **Forward chaining** is data-driven: start from known facts, fire rules whose premises are all known, and add their conclusions until the goal appears or nothing new can be added.
- **Backward chaining** is goal-driven: start from the goal and work backwards to find rules and facts that prove it. Prolog uses backward chaining.

Both run in time linear in the size of the KB for Horn clauses.

### 6.5 First-order logic (FOL)

Propositional logic cannot express facts about all objects compactly. FOL adds:

- **Objects** (constants such as John), **predicates** (relations such as Brother(John, Richard)) and **functions** (such as LeftLeg(John)).
- **Variables** and **quantifiers**:
  - Universal ∀: ∀x King(x) ⇒ Person(x) ("all kings are persons").
  - Existential ∃: ∃x Crown(x) ∧ OnHead(x, John) ("John has a crown on his head").

Common mistake: use ⇒ with ∀ and ∧ with ∃. Writing ∀x King(x) ∧ Person(x) wrongly says everything is a king and a person.

Quantifier duality: ¬∀x P(x) ≡ ∃x ¬P(x).

**Unification** finds a substitution that makes two expressions identical; for example Knows(John, x) and Knows(y, Mother(y)) unify with {y/John, x/Mother(John)}. FOL inference uses **generalised modus ponens**, which combines unification with modus ponens.

### 6.6 Other ways to represent knowledge

- **Semantic networks:** graphs where nodes are concepts and edges are relations (such as "is-a" and "has-part"). Inheritance follows is-a links.
- **Frames:** structured records with slots and default values for a stereotyped object or situation.
- **Ontologies:** formal descriptions of categories and the relations between them.

---

## Unit 7: Reasoning Under Uncertainty

### 7.1 Why probability?

Agents rarely know everything about the world, so logic alone is not enough. Probability expresses a degree of belief between 0 and 1.

Basic rules:

- 0 ≤ P(A) ≤ 1, and P(true) = 1.
- P(¬A) = 1 − P(A).
- P(A ∨ B) = P(A) + P(B) − P(A ∧ B).
- **Conditional probability:** P(A | B) = P(A ∧ B) / P(B).
- **Product rule:** P(A ∧ B) = P(A | B) P(B).
- **Independence:** A and B are independent if P(A ∧ B) = P(A) P(B).

### 7.2 Bayes' theorem

> P(H | E) = P(E | H) × P(H) / P(E)

- P(H) is the **prior**, P(E | H) the **likelihood**, P(H | E) the **posterior**, and P(E) the evidence (a normalising constant).
- P(E) = P(E | H) P(H) + P(E | ¬H) P(¬H).

**Worked example:** a disease affects 1% of people. A test detects it 90% of the time when present (sensitivity), and gives a false positive 5% of the time when absent. If a person tests positive, what is the probability they have the disease?

- P(D) = 0.01, P(+ | D) = 0.90, P(+ | ¬D) = 0.05.
- P(+) = 0.90 × 0.01 + 0.05 × 0.99 = 0.009 + 0.0495 = 0.0585.
- P(D | +) = 0.009 / 0.0585 ≈ **0.154 (about 15.4%)**.

The result is low because the disease is rare: most positive results are false positives. Ignoring the prior is called the **base-rate fallacy**.

### 7.3 Bayesian networks

A Bayesian network is a **directed acyclic graph (DAG)** where:

- each node is a random variable;
- each edge points from a parent to a child that it directly influences;
- each node has a **conditional probability table (CPT)** giving P(node | parents).

The full joint distribution is the product of the local CPTs:

> P(x1, ..., xn) = ∏ P(xi | Parents(Xi))

Each node is conditionally independent of its non-descendants given its parents. This makes the network much more compact than a full joint table.

Classic example (burglary network): Burglary and Earthquake both cause Alarm; Alarm causes JohnCalls and MaryCalls.

Inference can be **exact** (enumeration, variable elimination) or **approximate** (sampling methods such as rejection sampling, likelihood weighting and Gibbs sampling).

---

## Unit 8: Planning (overview)

Classical planning finds a sequence of actions to reach a goal, using a factored representation of states.

- **STRIPS / PDDL:** each action has **preconditions** (what must be true before) and **effects** (an add list and a delete list).
- Example action: Move(b, x, y) moves block b from x to y. Precondition: On(b, x), Clear(b), Clear(y). Effect: On(b, y), Clear(x), ¬On(b, x), ¬Clear(y).
- **Forward (progression) planning** searches from the initial state; **backward (regression) planning** searches from the goal.
- **Partial-order planning** commits to an order between actions only when necessary.

---

## Unit 9: Ethics and Responsible AI

- **Bias and fairness:** models trained on biased data can make unfair decisions (for example in hiring or loans).
- **Transparency and explainability:** people affected by AI decisions should be able to understand them.
- **Privacy:** AI systems often use personal data, which must be protected.
- **Accountability:** someone must be responsible when an AI system causes harm.
- **Safety:** systems should behave reliably, including in situations they were not trained on.

---

## Quick revision: key points

- AI approaches: thinking/acting × humanly/rationally; modern AI builds rational agents.
- PEAS describes a task environment; environments are classified by seven properties.
- Five agent types: simple reflex, model-based, goal-based, utility-based, learning.
- BFS is complete and optimal for equal step costs but memory-hungry; DFS is memory-light but incomplete; IDDFS gets the best of both.
- A\* uses f(n) = g(n) + h(n); it is optimal with an admissible heuristic (tree search) or a consistent heuristic (graph search).
- Alpha-beta pruning gives the same result as minimax and prunes when α ≥ β.
- CSPs: backtracking + MRV + least constraining value + forward checking / AC-3.
- Resolution proves KB ⊨ α by deriving the empty clause from KB ∧ ¬α.
- Bayes' theorem: posterior = likelihood × prior / evidence.
- A Bayesian network is a DAG with CPTs; the joint is the product of P(Xi | Parents(Xi)).
