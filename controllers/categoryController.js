import Category from "../models/Category.js"

export const createCategory = async(req, res) => {
    try {
        const { name } = req.body;

    await Category.create({
        name
    });
 res.status(201).json({
            message: "Category added successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Updated successfully", category });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
