# Machine Learning: Study Notes

B.Tech CSE (AI) · Evaluation notes set for Aurel

---

## Unit 1: Introduction to Machine Learning

### 1.1 What is Machine Learning?

Machine Learning (ML) is a branch of AI in which computers learn patterns from data instead of being explicitly programmed with rules.

Tom Mitchell's definition (1997): "A computer program is said to learn from experience **E** with respect to some class of tasks **T** and performance measure **P**, if its performance at tasks in T, as measured by P, improves with experience E."

Example, a spam filter: T = classifying emails as spam or not spam, P = percentage of emails classified correctly, E = a set of emails labelled by users.

Traditional programming takes **data + rules → answers**. Machine learning takes **data + answers → rules (a model)**.

### 1.2 Types of machine learning

| Type | Data | Goal | Examples |
| --- | --- | --- | --- |
| **Supervised learning** | Labelled data (input with the correct output) | Learn a mapping from inputs to outputs | Spam detection, house price prediction |
| **Unsupervised learning** | Unlabelled data | Find hidden structure or patterns | Customer segmentation, dimensionality reduction |
| **Semi-supervised learning** | A few labelled and many unlabelled examples | Use unlabelled data to improve learning | Labelling large photo collections |
| **Reinforcement learning** | Rewards and penalties from an environment | Learn actions that maximise total reward | Game-playing agents, robot control |

Supervised learning has two main tasks:

- **Classification:** the output is a category (spam or not spam, digit 0 to 9).
- **Regression:** the output is a continuous number (price, temperature).

### 1.3 Key terminology

- **Feature (attribute):** an input variable, such as the area of a house.
- **Label (target):** the output the model should predict.
- **Instance (sample, example):** one row of data.
- **Training set:** data used to fit the model.
- **Validation set:** data used to tune hyperparameters and choose models.
- **Test set:** data held back until the end to estimate performance on new data.
- **Parameters:** values learned from data (such as weights in linear regression).
- **Hyperparameters:** values set before training (such as k in k-NN or the learning rate).
- **Generalisation:** how well a model performs on new, unseen data.

### 1.4 The ML workflow

1. Define the problem and the success metric.
2. Collect data.
3. Clean and prepare data (preprocessing).
4. Split into training, validation and test sets.
5. Choose and train a model.
6. Evaluate and tune hyperparameters.
7. Test once on the test set.
8. Deploy and monitor.

---

## Unit 2: Data Preprocessing

### 2.1 Handling missing values

- Remove rows or columns with too many missing values.
- **Impute:** fill with the mean or median (numerical) or the mode (categorical), or predict the value with a model.

### 2.2 Encoding categorical data

- **Label encoding:** gives each category an integer (Red = 0, Green = 1). Suitable for ordinal data, because it implies an order.
- **One-hot encoding:** creates one binary column per category. Suitable for nominal data with no order.

### 2.3 Feature scaling

Many algorithms (k-NN, SVM, gradient descent, PCA) are sensitive to the scale of features.

- **Min-max normalisation:** x' = (x − min) / (max − min). Scales values to [0, 1]. Sensitive to outliers.
- **Standardisation (z-score):** z = (x − μ) / σ. Gives mean 0 and standard deviation 1.

Fit the scaler on the training data only, then apply it to validation and test data, to avoid **data leakage**.

### 2.4 Train-test split and cross-validation

- A common split is 70/30 or 80/20 between training and test data.
- **k-fold cross-validation:** split the data into k equal folds. Train on k − 1 folds and validate on the remaining fold, repeating k times so each fold is used once for validation. The final score is the average of the k scores. Common values are k = 5 or k = 10.
- **Stratified k-fold** keeps the class proportions the same in each fold, which matters for imbalanced data.
- **Leave-one-out cross-validation (LOOCV)** is k-fold with k = number of samples.

---

## Unit 3: Linear Regression

### 3.1 The model

Simple linear regression fits a straight line:

> ŷ = w·x + b

where w is the slope (weight) and b is the intercept (bias). Multiple linear regression uses many features: ŷ = w1x1 + w2x2 + ... + wnxn + b.

### 3.2 Cost function

The usual cost is the **Mean Squared Error (MSE)**:

> J(w, b) = (1/n) Σ (yi − ŷi)²

Training finds the w and b that minimise J.

### 3.3 Least squares solution

For simple linear regression:

> w = Σ (xi − x̄)(yi − ȳ) / Σ (xi − x̄)²
> b = ȳ − w·x̄

**Worked example:** points (1, 3), (2, 5), (3, 7).

- x̄ = 2, ȳ = 5.
- Σ (xi − x̄)(yi − ȳ) = (−1)(−2) + (0)(0) + (1)(2) = 4.
- Σ (xi − x̄)² = 1 + 0 + 1 = 2.
- w = 4 / 2 = 2, and b = 5 − 2 × 2 = 1.
- The fitted line is **ŷ = 2x + 1**, which passes through all three points, so MSE = 0. For x = 4 it predicts 9.

### 3.4 Gradient descent

Gradient descent minimises a cost function by repeatedly stepping in the direction of the negative gradient:

> w := w − α · ∂J/∂w
> b := b − α · ∂J/∂b

α is the **learning rate**.

- If α is too small, training converges very slowly.
- If α is too large, the updates overshoot and may diverge.

Variants:

- **Batch gradient descent:** uses the whole training set for each update. Stable but slow for large data.
- **Stochastic gradient descent (SGD):** uses one sample per update. Fast and noisy, which can help escape shallow local minima.
- **Mini-batch gradient descent:** uses small batches (such as 32 or 64 samples). The usual choice in practice.

### 3.5 Evaluating regression

- **MAE** (mean absolute error) = (1/n) Σ |yi − ŷi|.
- **MSE** and **RMSE** (= √MSE); RMSE is in the same units as y and penalises large errors more than MAE.
- **R² (coefficient of determination)** = 1 − SS_res / SS_tot. R² = 1 is a perfect fit; R² = 0 means the model is no better than always predicting the mean.

---

## Unit 4: Logistic Regression

Despite its name, logistic regression is a **classification** algorithm.

It passes a linear combination through the **sigmoid function**:

> σ(z) = 1 / (1 + e^(−z)), where z = w·x + b

- σ(z) is always between 0 and 1, so it is read as P(y = 1 | x).
- σ(0) = 0.5; σ(2) ≈ 0.881; σ(−2) ≈ 0.119.
- The default decision rule predicts class 1 if σ(z) ≥ 0.5, that is, if z ≥ 0. The **decision boundary** w·x + b = 0 is linear.

The cost function is **log loss (binary cross-entropy)**:

> J = −(1/n) Σ [yi log(ŷi) + (1 − yi) log(1 − ŷi)]

MSE is not used because, with the sigmoid, it gives a non-convex cost with many local minima; log loss is convex.

For more than two classes, **softmax regression** (multinomial logistic regression) or the one-vs-rest approach is used.

---

## Unit 5: Model Evaluation for Classification

### 5.1 Confusion matrix

| | Predicted positive | Predicted negative |
| --- | --- | --- |
| **Actual positive** | True Positive (TP) | False Negative (FN) |
| **Actual negative** | False Positive (FP) | True Negative (TN) |

- A **false positive** is a Type I error; a **false negative** is a Type II error.

### 5.2 Metrics

- **Accuracy** = (TP + TN) / (TP + TN + FP + FN)
- **Precision** = TP / (TP + FP): of everything predicted positive, how much was actually positive?
- **Recall (sensitivity, true positive rate)** = TP / (TP + FN): of all actual positives, how many did we find?
- **Specificity** = TN / (TN + FP)
- **F1 score** = 2 × Precision × Recall / (Precision + Recall): the harmonic mean of precision and recall.

When to prefer which:

- **Precision matters** when false positives are costly, such as a spam filter that must not hide important emails.
- **Recall matters** when false negatives are costly, such as cancer screening, where missing a patient is dangerous.
- **Accuracy is misleading on imbalanced data:** if 99% of transactions are genuine, a model that always predicts "genuine" scores 99% accuracy but catches no fraud.

**Worked example:** TP = 40, FP = 10, FN = 20, TN = 30 (100 samples).

- Accuracy = (40 + 30) / 100 = **0.70**
- Precision = 40 / (40 + 10) = **0.80**
- Recall = 40 / (40 + 20) ≈ **0.667**
- Specificity = 30 / (30 + 10) = **0.75**
- F1 = 2 × 0.80 × 0.667 / (0.80 + 0.667) ≈ **0.727**

### 5.3 ROC curve and AUC

The **ROC curve** plots the true positive rate (recall) against the false positive rate (FP / (FP + TN)) at different decision thresholds. **AUC** (area under the curve) summarises it: 1.0 is a perfect classifier and 0.5 is no better than random guessing.

---

## Unit 6: Bias, Variance, Overfitting and Regularisation

### 6.1 Underfitting and overfitting

- **Underfitting:** the model is too simple to capture the pattern. It performs badly on both training and test data. This is **high bias**.
- **Overfitting:** the model learns noise in the training data. It performs very well on training data but badly on test data. This is **high variance**.
- A good model balances the two.

### 6.2 Bias-variance trade-off

Expected test error = Bias² + Variance + Irreducible error (noise).

- **Bias** is error from wrong or overly simple assumptions.
- **Variance** is error from sensitivity to small changes in the training data.
- Making a model more complex usually lowers bias and raises variance. The goal is the complexity that minimises total error.

**Fixes for overfitting:** more training data, fewer or simpler features, regularisation, cross-validation, early stopping, pruning (for trees), dropout (for neural networks) and ensembles such as bagging.

**Fixes for underfitting:** a more complex model, more or better features, less regularisation and longer training.

### 6.3 Regularisation

Regularisation adds a penalty on large weights to the cost function:

- **L2 (Ridge):** J + λ Σ wj². Shrinks all weights towards zero but rarely to exactly zero.
- **L1 (Lasso):** J + λ Σ |wj|. Can make some weights exactly zero, so it also performs **feature selection**.
- **Elastic Net:** combines L1 and L2.

λ controls the strength: λ = 0 means no regularisation; a very large λ leads to underfitting.

---

## Unit 7: k-Nearest Neighbours (k-NN)

k-NN is a simple, **non-parametric**, **instance-based (lazy)** learning algorithm: it stores the training data and does the work at prediction time.

To classify a new point:

1. Compute the distance to every training point (usually Euclidean: d = √Σ (ai − bi)²; Manhattan distance is Σ |ai − bi|).
2. Pick the k nearest points.
3. **Classification:** majority vote of their labels. **Regression:** average of their values.

Choosing k:

- Small k (such as 1) is sensitive to noise and overfits.
- Large k smooths the boundary but may underfit.
- An odd k avoids ties in binary classification.

Notes: k-NN needs feature scaling, is slow at prediction time for large datasets, and suffers from the **curse of dimensionality** (distances become less meaningful in many dimensions).

---

## Unit 8: Decision Trees

### 8.1 Structure

A decision tree splits the data on feature tests. **Internal nodes** test a feature, **branches** are outcomes of the test, and **leaf nodes** give the prediction. Trees are easy to interpret and need no feature scaling.

### 8.2 Choosing splits

**Entropy** measures the impurity of a set S with class proportions pi:

> Entropy(S) = − Σ pi log2(pi)

Entropy is 0 for a pure set and 1 for a 50/50 binary split.

**Information gain** of splitting on attribute A:

> Gain(S, A) = Entropy(S) − Σ (|Sv| / |S|) × Entropy(Sv)

ID3 chooses the attribute with the highest information gain. C4.5 uses **gain ratio** to avoid favouring attributes with many values. CART uses the **Gini index**:

> Gini(S) = 1 − Σ pi²

**Worked example (play-tennis dataset):** 14 days, 9 "Yes" and 5 "No".

- Entropy(S) = −(9/14) log2(9/14) − (5/14) log2(5/14) ≈ **0.940**.
- Gini(S) = 1 − (9/14)² − (5/14)² ≈ **0.459**.
- Split on Outlook: Sunny has 2 Yes / 3 No (entropy ≈ 0.971), Overcast has 4 Yes / 0 No (entropy 0), Rain has 3 Yes / 2 No (entropy ≈ 0.971).
- Weighted entropy after the split = (5/14)(0.971) + (4/14)(0) + (5/14)(0.971) ≈ 0.694.
- Gain(S, Outlook) ≈ 0.940 − 0.694 = **0.246**. Outlook has the highest gain in this dataset, so it becomes the root.

### 8.3 Overfitting in trees

A tree grown until every leaf is pure usually overfits. Remedies:

- **Pre-pruning:** stop early using maximum depth, minimum samples per leaf or minimum gain.
- **Post-pruning:** grow the full tree, then remove branches that do not improve validation performance.

---

## Unit 9: Naive Bayes

Naive Bayes is a probabilistic classifier based on Bayes' theorem:

> P(C | x1, ..., xn) ∝ P(C) × Π P(xi | C)

The **"naive" assumption** is that all features are **conditionally independent given the class**. This is rarely true, but the classifier still works well in practice, especially for text.

- It predicts the class with the highest posterior.
- **Laplace (add-one) smoothing** stops a zero count from making the whole product zero.
- Variants: **Gaussian** (continuous features), **Multinomial** (word counts, text), **Bernoulli** (binary features).
- Strengths: very fast, works well with little data and many features (such as spam filtering).

---

## Unit 10: Support Vector Machines (SVM)

An SVM finds the **hyperplane** that separates two classes with the **maximum margin**.

- The hyperplane is w·x + b = 0.
- **Support vectors** are the training points closest to the hyperplane; they alone decide where it lies.
- The margin width is **2 / ‖w‖**, so maximising the margin means minimising ‖w‖.
- **Hard margin** allows no misclassification (only for perfectly separable data). **Soft margin** allows some errors, controlled by the hyperparameter **C**: a large C penalises errors heavily (narrow margin, risk of overfitting); a small C allows a wider margin with more errors.
- **Kernel trick:** for data that is not linearly separable, a kernel computes inner products in a higher-dimensional space without computing the mapping directly. Common kernels: linear, polynomial and **RBF (Gaussian)**.

---

## Unit 11: Ensemble Learning

Ensembles combine several models to get better performance than any single one.

- **Bagging (bootstrap aggregating):** trains models in parallel on random samples drawn **with replacement** and averages or votes. It mainly **reduces variance**.
- **Random Forest:** bagging of decision trees, where each split also considers only a random subset of features. This makes the trees less correlated.
- **Boosting:** trains models **sequentially**, each one focusing on the errors of the previous ones. It mainly **reduces bias**.
  - **AdaBoost** increases the weights of misclassified samples.
  - **Gradient Boosting** fits each new model to the residual errors (the negative gradient of the loss). XGBoost and LightGBM are fast implementations.
- **Stacking:** trains a meta-model on the predictions of several base models.

---

## Unit 12: Unsupervised Learning

### 12.1 k-Means clustering

k-Means groups data into k clusters.

1. Choose k and initialise k centroids (randomly or with **k-means++**).
2. **Assign** each point to the nearest centroid.
3. **Update** each centroid to the mean of the points assigned to it.
4. Repeat steps 2 and 3 until the assignments stop changing.

k-Means minimises the **within-cluster sum of squares (WCSS)**. It may converge to a local minimum, so it is often run several times.

**Choosing k:** the **elbow method** (plot WCSS against k and look for the bend) or the **silhouette score**.

**Worked example:** points 1, 2, 10, 11 on a line with k = 2 and initial centroids 1 and 10.

- Assign: {1, 2} to centroid 1, and {10, 11} to centroid 10.
- Update: new centroids are 1.5 and 10.5.
- Assign again: nothing changes, so the algorithm has converged with clusters {1, 2} and {10, 11}.

Limitations: k must be chosen in advance, it is sensitive to outliers and initial centroids, and it assumes roughly spherical clusters of similar size.

### 12.2 Hierarchical clustering

- **Agglomerative (bottom-up):** start with each point as its own cluster and repeatedly merge the two closest clusters.
- **Divisive (top-down):** start with one cluster and split it.
- The result is shown as a **dendrogram**; cutting it at a height gives the clusters.
- **Linkage** defines distance between clusters: single (closest points), complete (farthest points), average, or Ward's (minimum increase in variance).

### 12.3 DBSCAN

A density-based method with two parameters: eps (neighbourhood radius) and minPts. It finds clusters of any shape and marks low-density points as **noise (outliers)**, and it does not need k in advance.

### 12.4 Principal Component Analysis (PCA)

PCA is a **dimensionality reduction** technique.

1. Standardise the data.
2. Compute the covariance matrix.
3. Find its eigenvectors and eigenvalues.
4. The eigenvectors are the **principal components**, the directions of maximum variance; each eigenvalue tells how much variance its component explains.
5. Keep the top k components and project the data onto them.

Principal components are orthogonal (uncorrelated). PCA is used to reduce features, speed up training, remove noise and visualise data in 2D or 3D. It is unsupervised and finds only linear structure.

---

## Unit 13: Neural Networks (basics)

### 13.1 The perceptron

A perceptron computes a weighted sum of inputs plus a bias and applies a step function:

> output = 1 if w·x + b ≥ 0, otherwise 0

**Perceptron learning rule:** w := w + η (y − ŷ) x.

A single perceptron can only learn **linearly separable** functions. It can learn AND and OR but **not XOR**, which led to multi-layer networks.

### 13.2 Multi-layer perceptron (MLP)

An MLP has an input layer, one or more **hidden layers** and an output layer. Non-linear **activation functions** let it learn non-linear patterns.

| Activation | Formula | Notes |
| --- | --- | --- |
| Sigmoid | 1 / (1 + e^(−z)) | Output (0, 1); suffers from vanishing gradients |
| Tanh | (e^z − e^(−z)) / (e^z + e^(−z)) | Output (−1, 1); zero-centred |
| ReLU | max(0, z) | Fast, reduces vanishing gradients; units can "die" |
| Softmax | e^(zi) / Σ e^(zj) | Turns outputs into class probabilities |

### 13.3 Training

- **Forward pass:** compute the outputs layer by layer.
- **Loss:** compare outputs with the labels (MSE for regression, cross-entropy for classification).
- **Backpropagation:** use the chain rule to compute the gradient of the loss with respect to every weight, from the output layer back to the input.
- **Update:** adjust weights with gradient descent.
- An **epoch** is one full pass over the training data.

Common problems: **vanishing gradients** in deep networks (helped by ReLU and good initialisation) and overfitting (helped by dropout, regularisation and early stopping).

---

## Quick revision: key points

- ML learns rules from data; Mitchell's definition uses task T, performance P and experience E.
- Supervised (labelled; classification and regression), unsupervised (unlabelled), semi-supervised and reinforcement learning (rewards).
- Scale features for distance- and gradient-based methods; fit scalers on training data only.
- Linear regression minimises MSE; logistic regression uses the sigmoid and log loss and is a classifier.
- Gradient descent: w := w − α ∂J/∂w; the learning rate must be neither too small nor too large.
- Precision = TP / (TP + FP), Recall = TP / (TP + FN), F1 is their harmonic mean; accuracy misleads on imbalanced data.
- Overfitting = high variance; underfitting = high bias; regularisation (L1 Lasso, L2 Ridge) fights overfitting.
- Decision trees split by information gain (entropy) or Gini; prune to avoid overfitting.
- Naive Bayes assumes features are conditionally independent given the class.
- SVM maximises the margin 2 / ‖w‖; kernels handle non-linear data.
- Bagging reduces variance (Random Forest); boosting reduces bias (AdaBoost, Gradient Boosting).
- k-Means: assign to the nearest centroid, update centroids, repeat; choose k with the elbow method.
- PCA projects data onto the directions of maximum variance (eigenvectors of the covariance matrix).
- A single perceptron cannot learn XOR; MLPs with non-linear activations and backpropagation can.
