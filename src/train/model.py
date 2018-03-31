from torch import cat, Tensor
from torch.nn import Conv2d, Linear, LSTM, Module
from torch.nn.functional import relu, softmax, tanh


class LinizeModel(Module):
    def __init__(self, args):
        super().__init__()

        self.conv_l1_3 = Conv2d(1, 16, (8, 8), stride=1, padding=4)
        self.conv_l2_2 = Conv2d(1, 16, (8, 8), stride=2, padding=4)
        self.conv_l2_3 = Conv2d(16, 16, (4, 4), stride=2, padding=2)
        self.conv_l3_3 = Conv2d(16, 32, (4, 4), stride=1, padding=2)
        self.conv_l4_1 = Conv2d(1, 16, (8, 8), stride=4, padding=4)
        self.conv_l4_2 = Conv2d(16, 16, (4, 4), stride=1, padding=2)
        self.conv_l4_3 = Conv2d(32, 32, (4, 4), stride=2, padding=2)
        self.conv_l5 = Conv2d(64, 64 (4, 4), stride=2, padding=2)
        self.conv_l6 = Conv2d(64, 64, (2, 2), stride=4, padding=1)
        self.lstm_l7 = LSTM(4096, 128)
        self.linear_l8 = Linear(128, 64)
        self.linear_l9_1 = Linear(64, 16)
        self.linear_l9_2 = Linear(64, 32)
        self.linear_l10_1 = Linear(16, 4)
        self.linear_l10_2 = Linear(32, 2)
        self.linear_l10_3 = Linear(32, 2)
        self.linear_l10_4 = Linear(32, 2)

        self.zero_pad = Tensor([0, 0])

        self.args = args

    def forward(self, x):
        conv_output1 = relu(self.conv_l4_1(x))

        conv_output2 = relu(self.conv_l2_2(x))
        conv_output2 = relu(self.conv_l4_2(conv_output2))

        conv_output3 = relu(self.conv_l1_3(x))
        conv_output3 = relu(self.conv_l2_3(conv_output3))
        conv_output3 = relu(self.conv_l3_3(conv_output3))
        conv_output3 = relu(self.conv_l4_3(conv_output3))

        x = cat((conv_output1, conv_output2, conv_output3), 2)
        x = relu(self.conv_l5(x))
        x = relu(self.conv_l6(x))
        x = x.view(4096, -1)
        x = x.repeat(0, self.args.seq_size)
        x = relu(self.lstm_l7(x))
        x = relu(self.linear_l8(x))

        y1 = relu(self.linear_l9_1(x))
        y1 = softmax(self.linear_l10_1(y1))

        y2 = relu(self.linear_l9_2(x))
        y2_1 = cat((tanh(self.linear_l10_2(y2)), self.zero_pad), 0)
        y2_2 = cat((tanh(self.linear_l10_3(y2)), self.zero_pad), 0)
        y2_3 = cat((tanh(self.linear_l10_4(y2)), self.zero_pad), 0)

        y = cat((y1, y2_1, y2_2, y2_3), 1)

        return y
